import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Count
from scipy.sparse import csr_matrix
from django.utils import timezone
from datetime import datetime
from imagera.orders.models import Orders
from imagera.product.models import Products, SearchedProduct
from imagera.users.models import User


def get_data():
    products = Products.objects.all()
    orders = Orders.objects.all()
    searched_products = SearchedProduct.objects.all()
    users = User.objects.all()

    products_df = pd.DataFrame(
        list(
            products.values(
                "id",
                "slug",
                "product_name",
                "product_category_name",
                "sub_category_name",
                "brand_name",
                "is_top_selling",
            )
        )
    )
    order_items = []
    for order in orders:
        for item in order.item.all():
            order_items.append(
                {
                    "user_id": order.order_by.id if order.order_by else None,
                    "product_id": item.item.product.id,
                    "quantity": item.quantity,
                }
            )

    orders_df = pd.DataFrame(order_items)
    searched_df = pd.DataFrame(
        list(searched_products.values("user_id", "searched_term"))
    )
    users_df = pd.DataFrame(list(users.values("id", "gender", "dob")))
    return products_df, orders_df, searched_df, users_df


def get_user_age(dob):
    if pd.isnull(dob):
        return None
    today = datetime.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def get_content_based_recommendations(
    products_df,
    product_id,
    orders_df,
    users_df,
    user_age=None,
    user_gender=None,
    num_recommendations=10,
):
    if products_df.empty:
        return pd.DataFrame()  # Return empty dataframe if no products

    products_df["combined_features"] = products_df.apply(
        lambda x: f"{x['slug']}{ x['product_name']} {x['product_category_name']} {x['sub_category_name']} {x['brand_name']} {x['is_top_selling']}",
        axis=1,
    )
    tfidf_vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf_vectorizer.fit_transform(products_df["combined_features"])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    if product_id >= len(cosine_sim):
        return pd.DataFrame()
    sim_scores = list(enumerate(cosine_sim[product_id]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1 : num_recommendations + 1]
    recommended_product_ids = [i[0] for i in sim_scores]

    recommended_products = products_df[products_df["id"].isin(recommended_product_ids)]

    if user_age or user_gender:
        recommended_products = filter_products_by_demographics(
            recommended_products, orders_df, users_df, user_age, user_gender
        )

    return recommended_products


def get_collaborative_recommendations(
    orders_df,
    products_df,
    user_id,
    user_df,
    user_age=None,
    user_gender=None,
    num_recommendations=10,
):
    if orders_df.empty:
        return pd.DataFrame()  # Return empty dataframe if no orders
    orders_df = orders_df.groupby(['user_id', 'product_id'], as_index=False).sum()
    user_product_matrix = orders_df.pivot(
        index="user_id", columns="product_id", values="quantity"
    ).fillna(0)
    user_product_sparse_matrix = csr_matrix(user_product_matrix.values)
    user_similarity = cosine_similarity(user_product_sparse_matrix)
    user_similarity_df = pd.DataFrame(
        user_similarity,
        index=user_product_matrix.index,
        columns=user_product_matrix.index,
    )

    if user_id not in user_similarity_df.index:
        return pd.DataFrame()  # Return empty dataframe if user not found

    similarity_scores = user_similarity_df[user_id].sort_values(ascending=False)
    user_interactions = user_product_matrix.loc[user_id]
    interacted_products = user_interactions[user_interactions > 0].index.tolist()

    recommendations = []
    for similar_user_id in similarity_scores.index[1:]:
        similar_user_interactions = user_product_matrix.loc[similar_user_id]
        recommended_products = similar_user_interactions[
            similar_user_interactions > 0
        ].index.tolist()

        for product_id in recommended_products:
            if product_id not in interacted_products:
                recommendations.append(product_id)
                if len(recommendations) >= num_recommendations:
                    break
        if len(recommendations) >= num_recommendations:
            break

    recommended_products_info = products_df[products_df["id"].isin(recommendations)]

    if user_age or user_gender:
        recommended_products_info = filter_products_by_demographics(
            recommended_products_info, orders_df, user_df, user_age, user_gender
        )

    return recommended_products_info


def get_general_recommendations(
    products_df, orders_df, searched_df, num_recommendations=10
):
    if num_recommendations < 1 or num_recommendations > 50:
        return pd.DataFrame(
            {"message": ["Number of recommendations must be between 1 and 50."]}
        )

    if orders_df.empty:
        return pd.DataFrame({"message": ["No recommendations available at this time."]})
    # General recommendations based on overall popularity
    popular_products = (
        orders_df["product_id"].value_counts().head(num_recommendations).index.tolist()
    )
    popular_products_info = products_df[products_df["id"].isin(popular_products)]

    if len(popular_products_info) < num_recommendations:
        # If not enough popular products, add based on search terms
        most_searched = searched_df["searched_term"].value_counts().index.tolist()
        for term in most_searched:
            additional_products = products_df[
                products_df["product_name"].str.contains(term, case=False, na=False)
            ]
            popular_products_info = (
                pd.concat([popular_products_info, additional_products])
                .drop_duplicates()
                .head(num_recommendations)
            )
            if len(popular_products_info) >= num_recommendations:
                break

    return popular_products_info.head(num_recommendations)


def filter_products_by_demographics(
    products_df, orders_df, users_df, user_age, user_gender
):
    # Filter users of the same age group and gender
    users_filtered = users_df[
        (users_df["gender"] == user_gender)
        & (
            (
                users_df["dob"].apply(
                    lambda x: (pd.Timestamp.now().year - pd.Timestamp(x).year)
                )
                == user_age
            )
        )
    ]

    # Get the user IDs of filtered users
    user_ids_filtered = users_filtered["id"].tolist()

    # Get the products bought by these users
    orders_filtered = orders_df[orders_df["user_id"].isin(user_ids_filtered)]
    bought_product_ids = orders_filtered["product_id"].unique()

    # Filter products_df to include only those bought by the filtered users
    filtered_products_df = products_df[products_df["id"].isin(bought_product_ids)]
    return filtered_products_df


def get_hybrid_recommendations(user_id, num_recommendations=20):
    products_df, orders_df, searched_df, users_df = get_data()

    if products_df.empty:
        return pd.DataFrame({"message": ["No products available for recommendation."]})

    if user_id is not None:
        user_data = users_df[users_df["id"] == user_id].iloc[0]
        user_age = get_user_age(user_data["dob"])
        user_gender = user_data["gender"]

        collaborative_recommendations = get_collaborative_recommendations(
            orders_df,
            products_df,
            user_id,
            users_df,
            user_age,
            user_gender,
            num_recommendations,
        )

        if not collaborative_recommendations.empty:
            product_id = collaborative_recommendations["id"].values[0]
            content_recommendations = get_content_based_recommendations(
                products_df,
                product_id,
                orders_df,
                users_df,
                user_age,
                user_gender,
                num_recommendations,
            )
        else:
            most_searched = (
                searched_df["searched_term"].value_counts().idxmax()
                if not searched_df.empty
                else ""
            )
            if most_searched:
                product_id = products_df[
                    products_df["product_name"].str.contains(
                        most_searched, case=False, na=False
                    )
                ].id.values[0]
                content_recommendations = get_content_based_recommendations(
                    products_df,
                    product_id,
                    orders_df,
                    users_df,
                    user_age,
                    user_gender,
                    num_recommendations,
                )
            else:
                content_recommendations = (
                    pd.DataFrame()
                )  # No searches to base recommendations on

        hybrid_recommendations = (
            pd.concat([collaborative_recommendations, content_recommendations])
            .drop_duplicates()
            .head(num_recommendations)
        )
    else:
        hybrid_recommendations = get_general_recommendations(
            products_df, orders_df, searched_df, num_recommendations
        )

    if hybrid_recommendations.empty:
        return pd.DataFrame({"message": ["No recommendations available at this time."]})

    return hybrid_recommendations
