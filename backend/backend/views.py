from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def send_some_data(request):
    return Response({
        "data": "Hellow from django backend"
    })