from rest_framework import serializers
from .models import ChatbotUser, Log
from django.contrib.auth.models import User


class ChatbotUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatbotUser
        fields = ['id', 'username', 'email', 'phone']


class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = ['id', 'user', 'question', 'answer', 'time']