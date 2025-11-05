from django.conf import settings
import requests


class EsewaTransaction:
    @staticmethod
    def validate(order_id, total_amount, transaction_uuid):
        url = f"{settings.ESEWA_STATUS_URL}?product_code={order_id}&total_amount={total_amount}&transaction_uuid={transaction_uuid}"
        try:
            esewa_response = requests.post(url)
            esewa_response.raise_for_status()  # Raise an error for bad status codes
            response_data = esewa_response.json()
            if "failure" in response_data.text:
                return "Failure"
            if response_data.get("status") == "COMPLETE":
                return "Complete"
            else:
                return "Pending"
        except requests.exceptions.RequestException as e:
            return f"Error: {e}"


class KhaltiTransaction:
    @staticmethod
    def validate(pidx):
        url = settings.KHALTI_STATUS_URL
        try:
            body_data = {"pidx": pidx}
            secret_key = settings.KHALTI_SECRET_KEY
            header = {"Authorization": f"Key {secret_key}"}

            khalti_response = requests.post(url, headers=header, data=body_data)
            khalti_response.raise_for_status()  # Raise an error for bad status codes
            response_data = khalti_response.json()
            if response_data.get("status") == "COMPLETE":
                return "Complete"
            else:
                return "Pending"
        except requests.exceptions.RequestException as e:
            return f"Error: {e}"
