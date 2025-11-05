from functools import wraps

from django.http import JsonResponse
from django.views import defaults

error_message_dict = {
    400: "Bad Request.",
    403: "Permission Denied",
    404: "Not Found.",
    500: "Server Error",
}


def api_error_response(status_code, error_message=None):
    """
    Decorator for api views to send json response on error.
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if not request.path.startswith("/api/"):
                return view_func(request, *args, **kwargs)
            message = error_message or error_message_dict.get(status_code)
            return JsonResponse({"detail": message}, status=status_code)

        return _wrapped_view

    return decorator


bad_request = api_error_response(400)(defaults.bad_request)

page_not_found = api_error_response(404)(defaults.page_not_found)

permission_denied = api_error_response(403)(defaults.permission_denied)

server_error = api_error_response(500)(defaults.server_error)
