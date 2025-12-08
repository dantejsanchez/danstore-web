import mercadopago
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User 
from .models import Product, Category
from rest_framework_simplejwt.views import TokenObtainPairView 
from .serializers import ProductSerializer, CategorySerializer, UserSerializer, MyTokenObtainPairSerializer

# --- AUTENTICACIÓN ---
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

@api_view(['POST'])
def register_user(request):
    try:
        data = request.data
        if User.objects.filter(email=data['email']).exists():
            return Response({'message': 'Existe'}, status=400)
        user = User.objects.create_user(username=data['email'], email=data['email'], password=data['password'], first_name=data.get('first_name',''), last_name=data.get('last_name',''))
        return Response(UserSerializer(user, many=False).data)
    except Exception as e: return Response({'message': str(e)}, status=400)

# --- TIENDA ---
@api_view(['GET'])
def get_products(request):
    queryset = Product.objects.filter(is_active=True)
    if request.GET.get('search'): queryset = queryset.filter(name__icontains=request.GET.get('search'))
    if request.GET.get('category'): queryset = queryset.filter(category_id=request.GET.get('category'))
    return Response(ProductSerializer(queryset, many=True).data)

@api_view(['GET'])
def get_product(request, pk):
    try: return Response(ProductSerializer(Product.objects.get(pk=pk), many=False).data)
    except: return Response({'message': 'No encontrado'}, status=404)

@api_view(['GET'])
def get_categories(request): return Response(CategorySerializer(Category.objects.all(), many=True).data)

@api_view(['GET'])
def get_unique_brands(request): return Response(Product.objects.values_list('brand', flat=True).distinct().order_by('brand'))

@api_view(['GET'])
def get_related_products(request, pk):
    try: return Response(ProductSerializer(Product.objects.filter(category=Product.objects.get(pk=pk).category).exclude(pk=pk)[:4], many=True).data)
    except: return Response([])

# ==========================================
# 3. PAGOS (MODO DEBUG - SIN CRASH)
# ==========================================

# 🟢 TU TOKEN DE PRUEBA (Verificado)
MP_ACCESS_TOKEN = "APP_USR-4002223461716540-120200-b3ca03a7f86ff3bc6ed70a4e66f0c4c1-1331103831"

@api_view(['POST'])
def create_preference(request):
    try:
        sdk = mercadopago.SDK(MP_ACCESS_TOKEN)
        cart_items = request.data.get('items', [])
        items_list = []

        # 1. LIMPIEZA DE DATOS (Vital)
        # Convertimos a float e int aquí para que no falle aunque el frontend envíe texto
        for item in cart_items:
            try:
                precio_final = float(item['price'])
                cantidad_final = int(item.get('quantity', 1))
            except ValueError:
                print(f"❌ Dato inválido en producto: {item}")
                return Response({'error': 'Precio o cantidad inválidos'}, status=400)

            items_list.append({
                "title": item['name'],
                "quantity": cantidad_final,
                "unit_price": precio_final,
                "currency_id": "PEN"
            })

        # 2. CONFIGURACIÓN SIMPLE
        preference_data = {
            "items": items_list,
            # Quitamos auto_return temporalmente para ver si es la causa del bloqueo
            # "auto_return": "approved", 
            "back_urls": {
                "success": "http://localhost:5173/success",
                "failure": "http://localhost:5173/failure",
                "pending": "http://localhost:5173/pending"
            },
            "statement_descriptor": "DAN STORE",
            "external_reference": "PRUEBA-001"
        }

        # 3. CREACIÓN Y ANÁLISIS DE RESPUESTA
        print("🔵 Enviando a Mercado Pago...")
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]

        # 🚨 AQUÍ ESTÁ EL CAMBIO CRÍTICO 🚨
        # Verificamos si Mercado Pago aceptó (Status 201) ANTES de pedir el link.
        status_mp = preference_response.get("status")
        
        if status_mp not in [200, 201]:
            print("\n========================================")
            print("❌ MERCADO PAGO RECHAZÓ LA SOLICITUD:")
            print(f"Status: {status_mp}")
            print("MENSAJE EXACTO:", preference) # <-- ESTO NOS DIRÁ EL ERROR
            print("========================================\n")
            # Devolvemos el error al frontend para que no se quede cargando
            return Response(preference, status=400)

        # Si pasamos el filtro, el link existe seguro
        print(f"✅ ÉXITO: Link generado -> {preference['init_point']}")
        return Response({'init_point': preference['init_point']})

    except Exception as e:
        print("\n❌ ERROR DE PYTHON (CRASH):", e)
        return Response({'error': str(e)}, status=500)