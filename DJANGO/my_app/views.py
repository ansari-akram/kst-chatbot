from my_app.models import ChatbotUser, Log
from my_app.serializers import LogSerializer
from rest_framework import viewsets
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http import JsonResponse


class LogViewSet(viewsets.ModelViewSet):
    queryset = Log.objects.all()
    serializer_class = LogSerializer


def get_from_request(value, _request):
    try:
        _value = _request.POST[value]
    except:
        _value = ""
    
    return _value


@csrf_exempt
def login(request):
    if request.POST:
        username = get_from_request('username', request)
        email = get_from_request('email', request)
        phone = get_from_request('phone', request)
        
        users = ChatbotUser.objects.all()
        for i in users:
            if i.email == email:
                return JsonResponse({'status': 200, "user_id": i.id, 'username': i.username, 'email': i.email, 'phone': i.phone})
    
        chatbot_user = ChatbotUser.objects.create(username=username, email=email, phone=phone)
        return JsonResponse({'status': 201, "user_id": chatbot_user.id, 'username': username, 'email': email, 'phone': phone})
    
    else:
        print('returned')
        return JsonResponse({'status': 200})

