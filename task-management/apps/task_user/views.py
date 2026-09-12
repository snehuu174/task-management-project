from django.shortcuts import render
from .models import TaskUser
from django.http import HttpResponse, JsonResponse
# Create your views here.
from helpers.passwords import PasswordHelperObj
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
#Import sessions
from django.contrib.sessions.models import Session


@csrf_exempt
@require_http_methods(['POST'])
def signup(request):
    if request.method != 'POST':
        return JsonResponse({"message":"Method not allowed"}, status=405)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        print(data)
        name = data['name']
        email = data['email']
        password = data['password']
        print(name, email, password)
        # if not name or not email or not password:
        #     return JsonResponse({"message":"All fields are required"}, status=400)
        
        if TaskUser.objects.filter(email=email).exists():
            return JsonResponse({"message":"Email already exists"}, status=400) 
        try:
            hashed_password = PasswordHelperObj.hash_password(password)
            print(hashed_password)
            user = TaskUser(name=name, email=email, password=hashed_password)
            user.save()
                    
            return JsonResponse({"message":"User created successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"message":f"Error creating user: {str(e)}"}, status=500)     


@csrf_exempt
@require_http_methods(['POST'])
def login(request):
    if request.method != 'POST':
        return JsonResponse({"message":"Method not allowed"}, status=405)
    
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return JsonResponse({"message":"Email and password are required"}, status=400)
        
        try:
            user = TaskUser.objects.get(email=email)
            if PasswordHelperObj.verify_password(password, user.password):
                request.session['user_id'] = user.id  # Store user ID in session
                request.session['user_name'] = user.name  # Store user name in session
                return JsonResponse({"message":"Login successful"}, status=200)
            else:
                return JsonResponse({"message":"Invalid credentials"}, status=401)
        except TaskUser.DoesNotExist:
            return JsonResponse({"message":"User does not exist"}, status=404)


@require_http_methods(['GET'])
def session_user(request):
    user_id = request.session.get('user_id')
    user_name = request.session.get('user_name')

    if not user_id or not user_name:
        return JsonResponse({"message": "Not authenticated"}, status=401)

    return JsonResponse({"user_id": user_id, "user_name": user_name}, status=200)