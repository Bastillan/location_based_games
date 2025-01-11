from rest_framework.permissions import BasePermission


class IsStaff(BasePermission):
    """ Allows access only to staff users """

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
