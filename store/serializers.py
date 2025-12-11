from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken # <--- FALTABA ESTA IMPORTACIÓN VITAL
from .models import Product, Category, ProductImage      # <--- IMPORTAMOS ProductImage

# ==========================================
# 1. SERIALIZADORES DE USUARIO (AUTH)
# ==========================================

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']

    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff

    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            name = obj.email
        return name

class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

# ==========================================
# 2. SERIALIZADORES DE TIENDA (PRODUCTOS)
# ==========================================

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # Campo mágico 1: Texto bonito de la etiqueta ("🔥 Black Friday")
    label_display = serializers.CharField(source='get_label_display', read_only=True)
    
    # Campo mágico 2: Galería de imágenes extra
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        # Lista explícita y profesional de campos
        fields = [
            'id', 
            'name', 
            'brand', 
            'image', 
            'description', 
            'price', 
            'original_price', 
            'category', 
            'is_active', 
            'is_black_friday', # (Legacy)
            'label',           # El código: 'BF', 'OF'
            'label_display',   # El texto: 'Black Friday', 'Oferta'
            'images'           # Array de imágenes extra
        ]

# ==========================================
# 3. SERIALIZADOR DE LOGIN JWT
# ==========================================

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data