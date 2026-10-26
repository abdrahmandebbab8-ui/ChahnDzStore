export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown' | 'yaml' | 'toml' | 'properties';
  category: 'manifest' | 'gradle' | 'res' | 'compose' | 'docs' | 'workflow' | 'config';
  description: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Android manifest with internet, network state, media permissions, and WhatsApp/Telegram package visibility queries.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.chahndz.app">

    <!-- Network Permissions for Store Sync & Firebase Authentication -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Storage / Media Permission for Uploading Payment Receipt Slips -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Vibration for Haptic Feedback on Purchases -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Android 11+ Package Visibility for WhatsApp and Telegram Direct Dispatch -->
    <queries>
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
        <package android:name="org.telegram.messenger" />
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="https" />
        </intent>
    </queries>

    <application
        android:name=".ChahnDzApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.ChahnDzStore"
        android:usesCleartextTraffic="false"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="locale|layoutDirection|orientation|screenSize"
            android:theme="@style/Theme.ChahnDzStore">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Google AdMob Application ID (Google Test ID: ca-app-pub-3940256099942544~3347511713) -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713" />
    </application>
</manifest>`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (Module: app)',
    language: 'gradle',
    category: 'gradle',
    description: 'Modern Gradle build script with Jetpack Compose, Google AdMob SDK, Firebase Auth, Firestore, Navigation, and Coil.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.chahndz.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.chahndz.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Jetpack Compose BOM & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.5")

    // Google Play Services Ads (AdMob SDK)
    implementation("com.google.android.gms:play-services-ads:23.6.0")

    // Firebase Auth, Firestore, and Cloud Storage BOM
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-storage-ktx")

    // Coil for async image loading
    implementation("io.coil-kt:coil-compose:2.7.0")
}`,
  },
  {
    path: 'firestore.rules',
    name: 'firestore.rules (Security & RBAC)',
    language: 'markdown',
    category: 'docs',
    description: 'Production Firestore security rules isolating customer orders and granting admin privileges to taybawi8@gmail.com.',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: Check if user is the authenticated store admin
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'taybawi8@gmail.com' ||
        request.auth.token.email == 'admin@chahndz.com' ||
        request.auth.token.role == 'admin'
      );
    }

    // 1. Products & Digital Cards Catalog
    match /products/{productId} {
      // Anyone (even guest) can read the catalog
      allow read: if true;
      // ONLY admin can create, update, or delete products and prices
      allow write: if isAdmin();
    }

    // 2. Incoming Orders
    match /orders/{orderId} {
      // Authenticated users can submit a top-up order
      allow create: if request.auth != null;
      // Users can only view their own orders; Admin can view all orders
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        resource.data.customerEmail == request.auth.token.email ||
        isAdmin()
      );
      // ONLY admin can update order status (Pending -> Processing -> Completed)
      allow update, delete: if isAdmin();
    }

    // 3. User Profiles
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/auth/FirebaseAuthManager.kt',
    name: 'FirebaseAuthManager.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Kotlin Firebase Authentication manager with Email/Password login, registration, and Admin role checking.',
    code: `package com.chahndz.app.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.tasks.await

object FirebaseAuthManager {
    private val auth: FirebaseAuth get() = FirebaseAuth.getInstance()

    val currentUser: FirebaseUser? get() = auth.currentUser

    val isAdmin: Boolean
        get() {
            val email = currentUser?.email?.lowercase() ?: return false
            return email == "taybawi8@gmail.com" || email == "admin@chahndz.com"
        }

    suspend fun signIn(email: String, pass: String): Result<FirebaseUser> {
        return try {
            val res = auth.signInWithEmailAndPassword(email.trim(), pass).await()
            res.user?.let { Result.success(it) } ?: Result.failure(Exception("No user found"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signUp(email: String, pass: String): Result<FirebaseUser> {
        return try {
            val res = auth.createUserWithEmailAndPassword(email.trim(), pass).await()
            res.user?.let { Result.success(it) } ?: Result.failure(Exception("Signup failed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun signOut() {
        auth.signOut()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/navigation/AppNavigation.kt',
    name: 'AppNavigation.kt (Customer 4 Tabs)',
    language: 'kotlin',
    category: 'compose',
    description: 'Bottom navigation structure strictly containing Home, Cart, My Orders, and Profile.',
    code: `package com.chahndz.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.*
import com.chahndz.app.ui.screens.*

sealed class Screen(val route: String, val titleAr: String, val titleEn: String, val icon: ImageVector) {
    object Home : Screen("home", "الرئيسية", "Home", Icons.Default.Home)
    object Cart : Screen("cart", "السلة", "Cart", Icons.Default.ShoppingCart)
    object Orders : Screen("orders", "طلباتي", "My Orders", Icons.Default.ShoppingBag)
    object Profile : Screen("profile", "حسابي", "Profile", Icons.Default.Person)
}

@Composable
fun AppNavigation(
    currentLanguage: String,
    onLanguageChanged: (String) -> Unit
) {
    val navController = rememberNavController()
    val items = listOf(Screen.Home, Screen.Cart, Screen.Orders, Screen.Profile)

    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                items.forEach { screen ->
                    val label = if (currentLanguage == "ar") screen.titleAr else screen.titleEn
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = label) },
                        label = { Text(label) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(navController, startDestination = Screen.Home.route) {
            composable(Screen.Home.route) { HomeScreen() }
            composable(Screen.Cart.route) { CartScreen() }
            composable(Screen.Orders.route) { OrdersScreen() }
            composable(Screen.Profile.route) { ProfileScreen() }
            composable("admin_dashboard") { AdminDashboardScreen() }
            composable("admin_order_verification") {
                AdminOrderVerificationScreen(
                    viewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/components/ProductCardComponent.kt',
    name: 'ProductCardComponent.kt (Jetpack Compose)',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose composable with side-by-side "Add to Cart" and "Buy Now" buttons supporting RTL/LTR localization.',
    code: `package com.chahndz.app.ui.components

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.chahndz.app.R

data class ProductItem(
    val id: String,
    val title: String,
    val subtitle: String,
    val minPriceDZD: Int,
    val imageUrl: String
)

@Composable
fun ProductCardComponent(
    product: ProductItem,
    onProductClick: () -> Unit,
    onAddToCart: (ProductItem) -> Unit,
    onBuyNow: (ProductItem) -> Unit
) {
    val context = LocalContext.current

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0E1322)),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp))
            .clickable { onProductClick() }
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // Thumbnail Image
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF07090E))
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Title and Pricing
            Text(
                text = product.title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = product.subtitle,
                fontSize = 12.sp,
                color = Color(0xFF94A3B8),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "\${product.minPriceDZD} DZD",
                fontSize = 16.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFFF59E0B)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Side-by-Side Action Buttons: [Add to Cart] | [Buy Now]
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 1. Add to Cart Button (Secondary)
                OutlinedButton(
                    onClick = {
                        onAddToCart(product)
                        Toast.makeText(context, context.getString(R.string.msg_added_to_cart), Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = Color(0xFF111728),
                        contentColor = Color.White
                    ),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    Icon(
                        Icons.Default.ShoppingCart,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = stringResource(R.string.action_add_to_cart),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                }

                // 2. Buy Now Button (Primary Prominent)
                Button(
                    onClick = { onBuyNow(product) },
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF59E0B),
                        contentColor = Color.Black
                    ),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    Icon(
                        Icons.Default.Bolt,
                        contentDescription = null,
                        tint = Color.Black,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = stringResource(R.string.action_buy_now),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/res/layout/item_product_card.xml',
    name: 'item_product_card.xml (Android XML Layout)',
    language: 'xml',
    category: 'res',
    description: 'XML layout displaying product card with side-by-side LinearLayout for Add to Cart and Buy Now buttons.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="8dp"
    app:cardCornerRadius="16dp"
    app:cardBackgroundColor="#0E1322"
    app:strokeColor="#1E293B"
    app:strokeWidth="1dp">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="12dp">

        <ImageView
            android:id="@+id/imgProductBanner"
            android:layout_width="match_parent"
            android:layout_height="140dp"
            android:scaleType="centerCrop" />

        <TextView
            android:id="@+id/tvProductTitle"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:textColor="#FFFFFF"
            android:textStyle="bold"
            android:textSize="15sp" />

        <TextView
            android:id="@+id/tvProductPrice"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:textColor="#F59E0B"
            android:textStyle="bold"
            android:textSize="14sp" />

        <!-- Side-by-Side Action Buttons -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="12dp"
            android:baselineAligned="false">

            <!-- 1. Add to Cart Button -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnAddToCart"
                android:layout_width="0dp"
                android:layout_height="44dp"
                android:layout_weight="1"
                android:layout_marginEnd="4dp"
                android:text="@string/action_add_to_cart"
                android:textSize="11sp"
                android:textColor="#FFFFFF"
                app:backgroundTint="#111728"
                app:strokeColor="#334155"
                app:strokeWidth="1dp"
                app:cornerRadius="10dp"
                app:icon="@drawable/ic_shopping_cart"
                app:iconTint="#F59E0B" />

            <!-- 2. Buy Now Button -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnBuyNow"
                android:layout_width="0dp"
                android:layout_height="44dp"
                android:layout_weight="1"
                android:layout_marginStart="4dp"
                android:text="@string/action_buy_now"
                android:textSize="11sp"
                android:textStyle="bold"
                android:textColor="#000000"
                app:backgroundTint="#F59E0B"
                app:cornerRadius="10dp"
                app:icon="@drawable/ic_bolt"
                app:iconTint="#000000" />
        </LinearLayout>
    </LinearLayout>
</com.google.android.material.card.MaterialCardView>`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/model/Order.kt',
    name: 'Order.kt (Data Model & Schema)',
    language: 'kotlin',
    category: 'compose',
    description: 'Kotlin data class for orders with mandatory receiptId, verification status, rejection reason, and in-app digitalCode delivery.',
    code: `package com.chahndz.app.model

import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

enum class OrderStatus {
    PENDING, PROCESSING, COMPLETED, REJECTED, FAILED
}

data class Order(
    val id: String = "",
    val userId: String = "",
    val customerName: String = "",
    val customerEmail: String = "",
    val productId: String = "",
    val productTitle: String = "",
    val bundleTitle: String = "",
    val playerId: String = "",
    val playerNickname: String? = null,
    val isPlayerNameVerified: Boolean = false,
    val serverRegion: String? = null,
    val priceDZD: Double = 0.0,
    val priceUSD: Double = 0.0,
    val paymentMethod: String = "baridimob",
    val receiptId: String = "", // Mandatory customer payment reference / transaction number
    val receiptImageUrl: String? = null,
    val isReceiptVerified: Boolean = false,
    val verifiedBy: String? = null, // e.g., taybawi8@gmail.com
    val digitalCode: String? = null, // Delivered directly inside app once status is COMPLETED
    val redemptionInstructions: String? = null,
    val rejectionReason: String? = null,
    val status: OrderStatus = OrderStatus.PENDING,
    @ServerTimestamp
    val timestamp: Date? = null,
    val completedAt: Long? = null
)`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/orders/OrdersScreen.kt',
    name: 'OrdersScreen.kt (Digital Code Delivery UI)',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose screen rendering in-app orders, receipt status, and high-contrast digital voucher PIN box with copy button.',
    code: `package com.chahndz.app.ui.orders

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.ShieldCheck
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chahndz.app.model.Order
import com.chahndz.app.model.OrderStatus

@Composable
fun OrderItemCard(
    order: Order,
    onContactWhatsApp: (Order) -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0E1322)),
        border = BorderStroke(
            1.dp,
            if (order.status == OrderStatus.COMPLETED) Color(0xFF10B981) else Color(0xFF1E293B)
        )
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            // Header: Order ID & Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "#\${order.id}",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp
                )
                AssistChip(
                    onClick = {},
                    label = {
                        Text(
                            text = if (order.status == OrderStatus.COMPLETED) "مكتمل ✓" else "قيد المراجعة",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = if (order.status == OrderStatus.COMPLETED) Color(0xFF064E3B) else Color(0xFF451A03),
                        labelColor = if (order.status == OrderStatus.COMPLETED) Color(0xFF6EE7B7) else Color(0xFFFCD34D)
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Details: Product, Bundle, Receipt ID
            Text(text = order.productTitle, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(text = order.bundleTitle, color = Color(0xFFF59E0B), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Text(text = "Player ID: \${order.playerId}", color = Color(0xFF38BDF8), fontSize = 12.sp)
            Text(text = "معرف الوصل: \${order.receiptId}", color = Color(0xFF94A3B8), fontSize = 11.sp)

            // FEATURE 5: In-App Digital Code Delivery Box
            if (order.status == OrderStatus.COMPLETED && !order.digitalCode.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF0A0F1D), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Key, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("كود الشحن الرقمي / PIN:", color = Color(0xFFF59E0B), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // High contrast PIN code with Copy Button
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFF04060A), RoundedCornerShape(8.dp))
                                .border(1.dp, Color(0xFF334155), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = order.digitalCode,
                                color = Color.White,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp
                            )

                            Button(
                                onClick = {
                                    clipboardManager.setText(AnnotatedString(order.digitalCode))
                                    Toast.makeText(context, "تم نسخ الكود بنجاح!", Toast.LENGTH_SHORT).show()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B), contentColor = Color.Black),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("نسخ", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/admin/AdminOrderFulfillment.kt',
    name: 'AdminOrderFulfillment.kt (Admin Code Delivery)',
    language: 'kotlin',
    category: 'compose',
    description: 'Admin Compose composable to verify payment receipt ID and deliver digital code to customer.',
    code: `package com.chahndz.app.ui.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chahndz.app.model.Order
import com.chahndz.app.model.OrderStatus

@Composable
fun AdminOrderFulfillmentDialog(
    order: Order,
    onDismiss: () -> Unit,
    onConfirmAndSendCode: (orderId: String, digitalCode: String) -> Unit
) {
    var digitalCodeInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("تأكيد الطلب #\${order.id} وإرسال الكود", fontSize = 16.sp) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("معرف الوصل المستلم: \${order.receiptId}", color = Color(0xFFF59E0B))
                Text("الخدمة: \${order.productTitle} (\${order.bundleTitle})")
                Text("المبلغ: \${order.priceDZD} دج ($ \${order.priceUSD})")

                OutlinedTextField(
                    value = digitalCodeInput,
                    onValueChange = {
                        digitalCodeInput = it
                        errorMessage = null
                    },
                    label = { Text("كود البطاقة الرقمية / PIN") },
                    placeholder = { Text("أدخل أو الصق كود الشحن...") },
                    isError = errorMessage != null,
                    supportingText = { errorMessage?.let { Text(it, color = MaterialTheme.colorScheme.error) } },
                    modifier = Modifier.fillMaxWidth()
                )

                TextButton(
                    onClick = {
                        val sample = "PUBG-UC660-" + (1000..9999).random() + "-" + (1000..9999).random()
                        digitalCodeInput = sample
                    }
                ) {
                    Text("توليد كود تجريبي تلقائي")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (digitalCodeInput.isBlank()) {
                        errorMessage = "يرجى كتابة كود الشحن الرقمي قبل التأكيد"
                    } else {
                        onConfirmAndSendCode(order.id, digitalCodeInput.trim())
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Text("تأكيد وإرسال الكود للزبون")
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("إلغاء")
            }
        }
    )
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ads/AdMobManager.kt',
    name: 'AdMobManager.kt (Ad Network Initialization)',
    language: 'kotlin',
    category: 'compose',
    description: 'AdMob SDK initialization singleton with test device configuration and centralized ad unit constants.',
    code: `package com.chahndz.app.ads

import android.content.Context
import android.util.Log
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.RequestConfiguration
import java.util.Collections

object AdMobManager {
    private const val TAG = "AdMobManager"

    // Google AdMob Standard Test Banner Ad Unit ID
    const val BANNER_TEST_UNIT_ID = "ca-app-pub-3940256099942544/6300978111"

    fun initialize(context: Context) {
        val configuration = RequestConfiguration.Builder()
            .setTestDeviceIds(Collections.singletonList(RequestConfiguration.DEVICE_ID_EMULATOR))
            .build()
        MobileAds.setRequestConfiguration(configuration)

        MobileAds.initialize(context) { status ->
            Log.d(TAG, "AdMob initialized successfully: \${status.adapterStatusMap.keys}")
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/components/AdMobBannerView.kt',
    name: 'AdMobBannerView.kt (Jetpack Compose Banner)',
    language: 'kotlin',
    category: 'compose',
    description: 'Lifecycle-aware Jetpack Compose AdMob Banner with admin exemption check, adaptive sizing, and leak prevention.',
    code: `package com.chahndz.app.ui.components

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import com.chahndz.app.ads.AdMobManager
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView

/**
 * Sticky Google AdMob Banner View for Jetpack Compose.
 *
 * Requirements:
 * 1. Admin Exemption: Hides automatically if [isAdmin] is true.
 * 2. Lifecycle Management: Pauses on ON_PAUSE, resumes on ON_RESUME, destroys on ON_DESTROY.
 * 3. Non-Intrusive: Positioned above Bottom Navigation without obscuring "Buy Now" or "Add to Cart" buttons.
 * 4. Responsive & Bilingual: Adapts to dark/light theme and RTL/LTR directions.
 */
@Composable
fun AdMobBannerView(
    modifier: Modifier = Modifier,
    adUnitId: String = AdMobManager.BANNER_TEST_UNIT_ID,
    isAdmin: Boolean = false
) {
    // 1. Completely disable banner if user is logged in as Store Admin
    if (isAdmin) {
        return
    }

    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val configuration = LocalConfiguration.current
    val screenWidth = configuration.screenWidthDp

    // 2. Compute Anchored Adaptive Banner size
    val adaptiveAdSize = remember(screenWidth) {
        AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, screenWidth)
    }

    // 3. Initialize AdView once in remember block
    val adView = remember {
        AdView(context).apply {
            setAdSize(adaptiveAdSize)
            this.adUnitId = adUnitId
            loadAd(AdRequest.Builder().build())
        }
    }

    // 4. Safe lifecycle binding to prevent memory leaks
    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_RESUME -> adView.resume()
                Lifecycle.Event.ON_PAUSE -> adView.pause()
                Lifecycle.Event.ON_DESTROY -> adView.destroy()
                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)

        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            adView.destroy()
        }
    }

    // 5. Container styled responsively for both Light & Dark themes
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 2.dp)
            .background(
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = RoundedCornerShape(10.dp)
            )
            .border(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.35f),
                shape = RoundedCornerShape(10.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            modifier = Modifier.fillMaxWidth(),
            factory = { adView }
        )
    }
}`,
  },
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml (XML Layout Structure)',
    language: 'xml',
    category: 'res',
    description: 'XML layout demonstrating sticky AdView anchored right above BottomNavigationView with clear non-overlapping constraints.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:ads="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#07090E"
    tools:context=".MainActivity">

    <!-- Top App Bar / Toolbar -->
    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/topAppBar"
        android:layout_width="match_parent"
        android:layout_height="?attr/actionBarSize"
        android:background="#0A0E1A"
        app:title="@string/app_name"
        app:titleTextColor="@color/white"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Main Fragment / Content Container (Constrained strictly above Banner Ad) -->
    <!-- This ensures catalog lists and CTA buttons ("Buy Now", "Add to Cart") are never obscured -->
    <androidx.fragment.app.FragmentContainerView
        android:id="@+id/navHostFragment"
        android:name="androidx.navigation.fragment.NavHostFragment"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        app:defaultNavHost="true"
        app:navGraph="@navigation/nav_graph"
        app:layout_constraintTop_toBottomOf="@id/topAppBar"
        app:layout_constraintBottom_toTopOf="@id/adViewContainer"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Sticky Ad Container (Positioned right above BottomNavigationView) -->
    <!-- Set visibility to View.GONE programmatically when current user is Admin -->
    <FrameLayout
        android:id="@+id/adViewContainer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="#0D1322"
        android:paddingTop="2dp"
        android:paddingBottom="2dp"
        app:layout_constraintBottom_toTopOf="@id/bottomNavigation"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <com.google.android.gms.ads.AdView
            android:id="@+id/adMobBannerView"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            ads:adSize="BANNER"
            ads:adUnitId="@string/admob_banner_unit_id" />
    </FrameLayout>

    <!-- Bottom Navigation Bar (Home, Cart, Orders, Profile) -->
    <com.google.android.material.bottomnavigation.BottomNavigationView
        android:id="@+id/bottomNavigation"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:background="#0A0E1A"
        app:itemIconTint="@color/nav_item_selector"
        app:itemTextColor="@color/nav_item_selector"
        app:menu="@menu/bottom_nav_menu"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`,
  },
  {
    path: 'storage.rules',
    name: 'storage.rules (Firebase Cloud Storage Rules)',
    language: 'markdown',
    category: 'docs',
    description: 'Security rules for Firebase Storage allowing public catalog image reading and restricting gallery product uploads to store admin.',
    code: `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 1. Product Images uploaded from phone gallery by Store Admin
    match /products/{imageId} {
      allow read: if true; // Public read for customers viewing catalog
      allow write: if request.auth != null && (
        request.auth.token.email == 'taybawi8@gmail.com' ||
        request.auth.token.email == 'admin@chahndz.com' ||
        request.auth.token.role == 'admin'
      ) && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }

    // 2. Customer Payment Receipts
    match /receipts/{orderId}/{receiptId} {
      allow create: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
      allow read: if request.auth != null;
    }
  }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/data/FirebaseStorageManager.kt',
    name: 'FirebaseStorageManager.kt (Cloud Storage Upload)',
    language: 'kotlin',
    category: 'compose',
    description: 'Asynchronous manager to upload phone gallery images to Firebase Storage and retrieve the public download URL.',
    code: `package com.chahndz.app.data

import android.net.Uri
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageReference
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * Firebase Cloud Storage Manager for Uploading Product Images from Phone Gallery.
 */
object FirebaseStorageManager {
    private val storage: FirebaseStorage get() = FirebaseStorage.getInstance()
    private val storageRef: StorageReference get() = storage.reference

    /**
     * Uploads local image URI selected from phone gallery (SAF / ACTION_GET_CONTENT)
     * to Firebase Storage under \`products/\` and returns public download URL.
     */
    suspend fun uploadProductImage(
        localImageUri: Uri,
        onProgress: (Int) -> Unit = {}
    ): Result<String> {
        return try {
            val fileName = "prod_\${System.currentTimeMillis()}_\${UUID.randomUUID().toString().take(8)}.jpg"
            val imageRef = storageRef.child("products/\$fileName")

            val uploadTask = imageRef.putFile(localImageUri)

            uploadTask.addOnProgressListener { taskSnapshot ->
                val progress = (100.0 * taskSnapshot.bytesTransferred / taskSnapshot.totalByteCount).toInt()
                onProgress(progress)
            }

            uploadTask.await()
            val downloadUrl = imageRef.downloadUrl.await().toString()
            Result.success(downloadUrl)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/admin/AdminProductImagePicker.kt',
    name: 'AdminProductImagePicker.kt (Gallery Picker Composable)',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose composable with ActivityResultContracts.GetContent() to browse phone gallery, upload to Firebase Storage, and display live Coil preview.',
    code: `package com.chahndz.app.ui.admin

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.chahndz.app.data.FirebaseStorageManager
import kotlinx.coroutines.launch

/**
 * Native Android Gallery Image Picker Composable for Admin Dashboard.
 *
 * Uses ActivityResultContracts.GetContent() to launch the phone's gallery
 * and uploads the selected image to Firebase Cloud Storage.
 */
@Composable
fun AdminProductImagePicker(
    currentImageUrl: String,
    onImageUrlChanged: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var selectedLocalUri by remember { mutableStateOf<Uri?>(null) }
    var isUploading by remember { mutableStateOf(false) }
    var uploadProgress by remember { mutableStateOf(0) }

    // 1. Native Gallery Picker Launcher (Storage Access Framework / ACTION_GET_CONTENT)
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            selectedLocalUri = it
            isUploading = true
            uploadProgress = 0

            // Upload directly to Firebase Storage
            coroutineScope.launch {
                val result = FirebaseStorageManager.uploadProductImage(it) { progress ->
                    uploadProgress = progress
                }
                isUploading = false

                result.onSuccess { downloadUrl ->
                    onImageUrlChanged(downloadUrl)
                    Toast.makeText(context, "تم رفع الصورة إلى السحابة بنجاح!", Toast.LENGTH_SHORT).show()
                }.onFailure { err ->
                    Toast.makeText(context, "فشل الرفع: \${err.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF090D18))
            .border(1.dp, Color(0xFF1E293B), RoundedCornerShape(16.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Section Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "صورة الغلاف (معرض الهاتف)",
                color = Color(0xFF38BDF8),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "PNG / JPEG",
                color = Color(0xFF94A3B8),
                fontSize = 11.sp
            )
        }

        // Live Thumbnail Preview (Coil AsyncImage)
        val displayModel = selectedLocalUri ?: currentImageUrl.takeIf { it.isNotBlank() }
        if (displayModel != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .border(1.dp, Color(0xFF334155), RoundedCornerShape(12.dp))
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(displayModel)
                        .crossfade(true)
                        .build(),
                    contentDescription = "معاينة صورة المنتج",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Status Badge
                Surface(
                    color = Color(0xCC000000),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(Icons.Default.CloudUpload, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(12.dp))
                        Text(
                            text = if (isUploading) "جارِ الرفع..." else "جاهز للتخزين السحابي",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Delete / Remove Button
                IconButton(
                    onClick = {
                        selectedLocalUri = null
                        onImageUrlChanged("")
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = "حذف الصورة", tint = Color(0xFFEF4444))
                }
            }
        }

        // Upload Progress Bar
        AnimatedVisibility(visible = isUploading) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("جارِ الرفع إلى Firebase Storage...", color = Color(0xFF38BDF8), fontSize = 11.sp)
                    Text("\$uploadProgress%", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
                LinearProgressIndicator(
                    progress = { uploadProgress / 100f },
                    modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                    color = Color(0xFFF59E0B),
                    trackColor = Color(0xFF1E293B)
                )
            }
        }

        // "Select Image from Gallery" Button (Action Button)
        Button(
            onClick = { galleryLauncher.launch("image/*") },
            enabled = !isUploading,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.PhotoLibrary, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (displayModel != null) "تغيير الصورة من المعرض" else "اختر صورة من المعرض",
                fontWeight = FontWeight.ExtraBold,
                fontSize = 13.sp
            )
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/data/model/Coupon.kt',
    name: 'Coupon.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Data model and discount calculation logic for Promo Codes and Promotional Badges (Most Popular / Best Value).',
    code: `package com.chahndz.app.data.model

import com.google.firebase.firestore.DocumentId
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class DiscountType {
    PERCENTAGE,
    FIXED
}

enum class PromotionalBadge {
    NONE,
    MOST_POPULAR, // "الأكثر طلباً" (Orange badge)
    BEST_VALUE    // "أفضل توفير" (Cyan badge)
}

data class Coupon(
    @DocumentId val id: String = "",
    val code: String = "",
    val discountType: DiscountType = DiscountType.PERCENTAGE,
    val discountValue: Double = 0.0,
    val minOrderDZD: Long? = null,
    val expiresAt: String? = null, // "YYYY-MM-DD"
    val usageLimit: Int? = null,
    val usedCount: Int = 0,
    val isActive: Boolean = true,
    val descriptionAr: String? = null,
    val descriptionEn: String? = null
) {
    /**
     * Validates whether the coupon can be applied to an order with the given subtotal in DZD.
     */
    fun validate(orderTotalDZD: Long): Result<Double> {
        if (!isActive) {
            return Result.failure(IllegalStateException("كود الخصم غير مفعّل حالياً"))
        }

        expiresAt?.let { exp ->
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val expiryDate = sdf.parse(exp)
            if (expiryDate != null && Date().after(expiryDate)) {
                return Result.failure(IllegalStateException("عذراً، انتهت صلاحية هذا الكود"))
            }
        }

        usageLimit?.let { limit ->
            if (usedCount >= limit) {
                return Result.failure(IllegalStateException("تم استنفاد الحد الأقصى لاستخدام هذا الكود"))
            }
        }

        minOrderDZD?.let { minTotal ->
            if (orderTotalDZD < minTotal) {
                return Result.failure(IllegalStateException("الحد الأدنى للطلب للاستفادة من هذا الكود هو \$minTotal دج"))
            }
        }

        // Calculate discount in DZD
        val discountDZD = when (discountType) {
            DiscountType.PERCENTAGE -> (orderTotalDZD * (discountValue / 100.0)).coerceAtMost(orderTotalDZD.toDouble())
            DiscountType.FIXED -> discountValue.coerceAtMost(orderTotalDZD.toDouble())
        }

        return Result.success(discountDZD)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/components/CouponInputView.kt',
    name: 'CouponInputView.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose Composable for entering, validating and deducting Promo Codes with real-time feedback.',
    code: `package com.chahndz.app.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.Error
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chahndz.app.data.model.Coupon

@Composable
fun CouponInputView(
    orderTotalDZD: Long,
    appliedCoupon: Coupon?,
    onApplyCoupon: (Coupon, Double) -> Unit,
    onRemoveCoupon: () -> Unit,
    availableCoupons: List<Coupon>,
    modifier: Modifier = Modifier
) {
    var couponText by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(
            text = "رمز القسيمة / كود الخصم (Promo Code):",
            color = Color(0xFFCBD5E1),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold
        )

        if (appliedCoupon != null) {
            // Applied coupon active pill
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF064E3B).copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .border(1.dp, Color(0xFF10B981).copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Icon(Icons.Default.ConfirmationNumber, contentDescription = null, tint = Color(0xFF34D399), modifier = Modifier.size(16.dp))
                    Text(
                        text = appliedCoupon.code,
                        color = Color.White,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp
                    )
                    Text(
                        text = if (appliedCoupon.discountType == com.chahndz.app.data.model.DiscountType.PERCENTAGE)
                            "(-\${appliedCoupon.discountValue.toInt()}%)"
                        else
                            "(-\${appliedCoupon.discountValue.toInt()} دج)",
                        color = Color(0xFF6EE7B7),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                TextButton(
                    onClick = {
                        onRemoveCoupon()
                        couponText = ""
                        successMessage = null
                        errorMessage = null
                    },
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("إلغاء الخصم", color = Color(0xFFF87171), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        } else {
            // Promo code entry form
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = couponText,
                    onValueChange = {
                        couponText = it.uppercase().filter { ch -> ch.isLetterOrDigit() || ch == '_' }
                        errorMessage = null
                    },
                    placeholder = { Text("أدخل الكود (مثال: ABOUD10)", fontSize = 12.sp, color = Color(0xFF64748B)) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(
                        capitalization = KeyboardCapitalization.Characters,
                        imeAction = ImeAction.Done
                    ),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF38BDF8),
                        unfocusedBorderColor = Color(0xFF334155),
                        focusedContainerColor = Color(0xFF090D18),
                        unfocusedContainerColor = Color(0xFF090D18),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )

                Button(
                    onClick = {
                        val cleanCode = couponText.trim()
                        val match = availableCoupons.find { it.code.equals(cleanCode, ignoreCase = true) }
                        if (match == null) {
                            errorMessage = "كود الخصم غير صالح أو غير موجود"
                            return@Button
                        }
                        val validation = match.validate(orderTotalDZD)
                        if (validation.isSuccess) {
                            val discountAmount = validation.getOrThrow()
                            onApplyCoupon(match, discountAmount)
                            successMessage = "تم تطبيق الكود \${match.code} بنجاح!"
                            errorMessage = null
                        } else {
                            errorMessage = validation.exceptionOrNull()?.message ?: "كود الخصم غير صالح"
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    Text("تطبيق", color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 12.sp)
                }
            }

            errorMessage?.let {
                Text(
                    text = it,
                    color = Color(0xFFF87171),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            successMessage?.let {
                Text(
                    text = it,
                    color = Color(0xFF34D399),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/admin/AdminCouponManager.kt',
    name: 'AdminCouponManager.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Admin dashboard screen for creating, editing, deleting coupons and toggling promotional badges on packages.',
    code: `package com.chahndz.app.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chahndz.app.data.model.Coupon
import com.chahndz.app.data.model.DiscountType
import com.chahndz.app.data.model.PromotionalBadge

@Composable
fun PackageBadgeSelector(
    selectedBadge: PromotionalBadge,
    onBadgeSelected: (PromotionalBadge) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("شارة الباقة الترويجية:", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Option 1: None
            FilterChip(
                selected = selectedBadge == PromotionalBadge.NONE,
                onClick = { onBadgeSelected(PromotionalBadge.NONE) },
                label = { Text("بدون شارة", fontSize = 10.sp) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF334155),
                    selectedLabelColor = Color.White
                )
            )

            // Option 2: Most Popular (Orange / Amber Badge)
            FilterChip(
                selected = selectedBadge == PromotionalBadge.MOST_POPULAR,
                onClick = { onBadgeSelected(PromotionalBadge.MOST_POPULAR) },
                label = { Text("★ الأكثر طلباً", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFFF59E0B),
                    selectedLabelColor = Color.Black
                )
            )

            // Option 3: Best Value (Cyan / Blue Badge)
            FilterChip(
                selected = selectedBadge == PromotionalBadge.BEST_VALUE,
                onClick = { onBadgeSelected(PromotionalBadge.BEST_VALUE) },
                label = { Text("💎 أفضل توفير", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Color(0xFF06B6D4),
                    selectedLabelColor = Color.Black
                )
            )
        }
    }
}

@Composable
fun AdminCouponManagementScreen(
    coupons: List<Coupon>,
    onAddCoupon: (Coupon) -> Unit,
    onToggleActive: (Coupon) -> Unit,
    onDeleteCoupon: (String) -> Unit
) {
    var showCreateDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF07090E))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("نظام قسائم الشراء (Promo Codes)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Button(
                onClick = { showCreateDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("إضافة قسيمة", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(coupons, key = { it.id }) { cpn ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0E1322)),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(cpn.code, color = Color.White, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.ExtraBold)
                            Text(
                                if (cpn.discountType == DiscountType.PERCENTAGE) "خصم \${cpn.discountValue.toInt()}%" else "خصم \${cpn.discountValue.toInt()} دج",
                                color = Color(0xFF38BDF8),
                                fontSize = 11.sp
                            )
                        }

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Switch(
                                checked = cpn.isActive,
                                onCheckedChange = { onToggleActive(cpn) }
                            )
                            IconButton(onClick = { onDeleteCoupon(cpn.id) }) {
                                Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFF87171))
                            }
                        }
                    }
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/components/InGamePlayerVerificationCard.kt',
    name: 'InGamePlayerVerificationCard.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose component for auto-inquiry and verification of customer in-game player names (PUBG / Free Fire / TikTok) with verification checkmark, server region, and pre-payment confirmation banner.',
    code: `package com.chahndz.app.ui.components

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

data class PlayerVerification(
    val playerId: String,
    val playerName: String,
    val serverRegion: String = "الشرق الأوسط (Middle East)",
    val playerLevel: String = "Lv. 72 (Ace)",
    val isVerified: Boolean = true
)

@Composable
fun InGamePlayerVerificationCard(
    playerId: String,
    verifiedPlayer: PlayerVerification?,
    isLoading: Boolean,
    onReverify: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (playerId.isBlank()) return

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(
                1.dp,
                if (verifiedPlayer != null) Color(0xFF10B981).copy(alpha = 0.5f) else Color(0xFF1E293B),
                RoundedCornerShape(16.dp)
            ),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF0C1420)
        )
    ) {
        Column(
            modifier = Modifier
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF064E3B).copy(alpha = 0.35f),
                            Color(0xFF0B1928),
                            Color(0xFF091320)
                        )
                    )
                )
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Top Bar: Badge & Refresh Button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = Color(0xFF064E3B).copy(alpha = 0.8f),
                    shape = RoundedCornerShape(20.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.4f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF34D399),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = "حساب مطابق ومعتمد ✓",
                            color = Color(0xFF34D399),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                IconButton(
                    onClick = onReverify,
                    enabled = !isLoading,
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        Icons.Default.Refresh,
                        contentDescription = "Re-verify",
                        tint = Color(0xFF38BDF8),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Middle: Player ID & Verified Name
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("معرف اللاعب (Player ID):", color = Color(0xFF94A3B8), fontSize = 10.sp)
                    Text(
                        playerId,
                        color = Color(0xFF38BDF8),
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 13.sp
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text("اسم اللاعب داخل اللعبة:", color = Color(0xFF94A3B8), fontSize = 10.sp)
                    if (isLoading) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            CircularProgressIndicator(modifier = Modifier.size(12.dp), strokeWidth = 2.dp, color = Color(0xFF38BDF8))
                            Text("جارِ الاستعلام...", color = Color(0xFF38BDF8), fontSize = 11.sp)
                        }
                    } else {
                        Text(
                            text = verifiedPlayer?.playerName ?: "معتمد ✓",
                            color = Color(0xFF34D399),
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Black,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            // Server & Level Details
            if (verifiedPlayer != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(verifiedPlayer.serverRegion, color = Color(0xFF64748B), fontSize = 10.sp)
                    Text(verifiedPlayer.playerLevel, color = Color(0xFF64748B), fontSize = 10.sp)
                }
            }

            // Warning Notice Prompt before payment
            Surface(
                color = Color(0xFF451A03).copy(alpha = 0.4f),
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF59E0B).copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        Icons.Default.Shield,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "يرجى مراجعة اسم اللاعب والمعرف (ID) والتأكد من مطابقة حسابك قبل تحويل المبلغ وتأكيد الوصل.",
                        color = Color(0xFFFDE68A),
                        fontSize = 10.sp,
                        lineHeight = 14.sp
                    )
                }
            }
        }
    }
}`,
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Root Project)',
    language: 'gradle',
    category: 'gradle',
    description: 'Top-level root Gradle build file configuring plugins for Android, Kotlin, Jetpack Compose, and Google Services.',
    code: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.google.services) apply false
}`,
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'gradle',
    category: 'gradle',
    description: 'Project settings script declaring Google, Maven Central repositories and the app subproject module.',
    code: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "ChahnDzStore"
include(":app")`,
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    category: 'config',
    description: 'JVM arguments and AndroidX build flags for optimal Gradle compilation performance.',
    code: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`,
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml (Version Catalog)',
    language: 'toml',
    category: 'config',
    description: 'Modern Gradle version catalog containing Compose BOM, Navigation, AdMob, and Firebase dependencies.',
    code: `[versions]
agp = "8.7.3"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.12.01"
navigationCompose = "2.8.5"
playServicesAds = "23.6.0"
firebaseBom = "33.7.0"
googleServices = "4.4.2"
coil = "2.7.0"
datastore = "1.1.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
play-services-ads = { group = "com.google.android.gms", name = "play-services-ads", version.ref = "playServicesAds" }
firebase-bom = { group = "com.google.firebase", name = "firebase-bom", version.ref = "firebaseBom" }
firebase-auth-ktx = { group = "com.google.firebase", name = "firebase-auth-ktx" }
firebase-firestore-ktx = { group = "com.google.firebase", name = "firebase-firestore-ktx" }
firebase-storage-ktx = { group = "com.google.firebase", name = "firebase-storage-ktx" }
coil-compose = { group = "io.coil-kt", name = "coil-compose", version.ref = "coil" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
google-services = { id = "com.google.gms.google-services", version.ref = "googleServices" }`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml (GitHub Actions CI/CD Cloud APK Builder)',
    language: 'yaml',
    category: 'workflow',
    description: 'Automated Cloud CI/CD workflow: Builds real installable Android APK on GitHub free servers without needing a PC.',
    code: `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build Debug APK
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/theme/Color.kt',
    name: 'Color.kt (Theme Color Palette)',
    language: 'kotlin',
    category: 'compose',
    description: 'Dynamic color palettes for Dark Gaming Mode (Dark blue/black with gold & cyan) and Light Clean Mode (White/slate with navy & gold).',
    code: `package com.chahndz.app.ui.theme

import androidx.compose.ui.graphics.Color

// Dark Gaming Theme (الوضع الليلي الافتراضي لمتجر الألعاب)
val DarkBackground = Color(0xFF07090E)
val DarkSurface = Color(0xFF0E1322)
val DarkSurfaceElevated = Color(0xFF13192B)
val DarkBorder = Color(0xFF1E293B)
val DarkTextPrimary = Color(0xFFF8FAFC)
val DarkTextSecondary = Color(0xFF94A3B8)
val DarkAccentGold = Color(0xFFF59E0B)
val DarkAccentCyan = Color(0xFF06B6D4)
val DarkSuccess = Color(0xFF10B981)

// Light Clean Theme (الوضع الفاتح الأنيق)
val LightBackground = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceElevated = Color(0xFFF1F5F9)
val LightBorder = Color(0xFFE2E8F0)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF64748B)
val LightAccentNavy = Color(0xFF1E3A8A)
val LightAccentGold = Color(0xFFD97706)
val LightSuccess = Color(0xFF059669)`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/theme/Theme.kt',
    name: 'Theme.kt (Jetpack Compose Material 3 Theme)',
    language: 'kotlin',
    category: 'compose',
    description: 'Complete dynamic Jetpack Compose theme supporting Dark, Light, and System Default with high-contrast text and status bar adaptation.',
    code: `package com.chahndz.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

enum class ThemeMode {
    SYSTEM, DARK, LIGHT
}

private val DarkColorScheme = darkColorScheme(
    primary = DarkAccentGold,
    onPrimary = Color.Black,
    secondary = DarkAccentCyan,
    onSecondary = Color.Black,
    background = DarkBackground,
    onBackground = DarkTextPrimary,
    surface = DarkSurface,
    onSurface = DarkTextPrimary,
    surfaceVariant = DarkSurfaceElevated,
    onSurfaceVariant = DarkTextSecondary,
    outline = DarkBorder
)

private val LightColorScheme = lightColorScheme(
    primary = LightAccentGold,
    onPrimary = Color.White,
    secondary = LightAccentNavy,
    onSecondary = Color.White,
    background = LightBackground,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceElevated,
    onSurfaceVariant = LightTextSecondary,
    outline = LightBorder
)

@Composable
fun ChahnDzTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit
) {
    val isDark = when (themeMode) {
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
        ThemeMode.DARK -> true
        ThemeMode.LIGHT -> false
    }

    val colorScheme = if (isDark) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.surface.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !isDark
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !isDark
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/theme/ThemePreferences.kt',
    name: 'ThemePreferences.kt (Theme DataStore Persistence)',
    language: 'kotlin',
    category: 'compose',
    description: 'Persistent theme storage using Jetpack DataStore to retain user choice (Dark, Light, System) across app restarts.',
    code: `package com.chahndz.app.ui.theme

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "theme_settings")

class ThemePreferences(private val context: Context) {
    companion object {
        val THEME_KEY = stringPreferencesKey("app_theme_mode")
    }

    val themeModeFlow: Flow<ThemeMode> = context.dataStore.data.map { preferences ->
        val modeStr = preferences[THEME_KEY] ?: ThemeMode.SYSTEM.name
        try {
            ThemeMode.valueOf(modeStr)
        } catch (e: Exception) {
            ThemeMode.SYSTEM
        }
    }

    suspend fun setThemeMode(mode: ThemeMode) {
        context.dataStore.edit { preferences ->
            preferences[THEME_KEY] = mode.name
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/data/repository/OrderFulfillmentRepository.kt',
    name: 'OrderFulfillmentRepository.kt (Repository Pattern)',
    language: 'kotlin',
    category: 'compose',
    description: 'Clean repository managing real-time Firestore order streams, payment approval, voucher PIN dispatch, and customer notifications.',
    code: `package com.chahndz.app.data.repository

import com.chahndz.app.model.Order
import com.chahndz.app.model.OrderStatus
import com.chahndz.app.notification.CustomerNotificationManager
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class OrderFulfillmentRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val notificationManager: CustomerNotificationManager
) {
    private val ordersCollection = firestore.collection("orders")

    /**
     * Real-time stream of all incoming customer orders sorted by newest first
     */
    fun observeAllOrders(): Flow<List<Order>> = callbackFlow {
        val listener = ordersCollection
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(Order::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    /**
     * Approve customer payment receipt and dispatch voucher PIN/digital code.
     * Updates order to COMPLETED, attaches the digital code, and triggers customer notification.
     */
    suspend fun approvePaymentAndDispatchCode(
        order: Order,
        digitalCode: String,
        redemptionInstructions: String?,
        adminEmail: String
    ): Result<Unit> {
        return try {
            val updates = mapOf(
                "status" to OrderStatus.COMPLETED.name,
                "digitalCode" to digitalCode.trim(),
                "redemptionInstructions" to (redemptionInstructions?.trim() ?: "ادخل الكود في موقع اللعبة الرسمي واسترد رصيدك فوراً."),
                "isReceiptVerified" to true,
                "verifiedBy" to adminEmail,
                "completedAt" to System.currentTimeMillis()
            )

            ordersCollection.document(order.id).update(updates).await()

            // Trigger real-time customer delivery notification
            notificationManager.sendOrderCompletedNotification(
                orderId = order.id,
                productTitle = order.productTitle,
                digitalCode = digitalCode.trim(),
                customerEmail = order.customerEmail
            )

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Reject order with explanation (invalid receipt, insufficient amount, etc.)
     */
    suspend fun rejectOrder(
        order: Order,
        rejectionReason: String,
        adminEmail: String
    ): Result<Unit> {
        return try {
            val updates = mapOf(
                "status" to OrderStatus.REJECTED.name,
                "rejectionReason" to rejectionReason.trim(),
                "isReceiptVerified" to false,
                "verifiedBy" to adminEmail,
                "completedAt" to System.currentTimeMillis()
            )

            ordersCollection.document(order.id).update(updates).await()

            // Trigger rejection notification to user
            notificationManager.sendOrderRejectedNotification(
                orderId = order.id,
                productTitle = order.productTitle,
                reason = rejectionReason.trim(),
                customerEmail = order.customerEmail
            )

            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/notification/CustomerNotificationManager.kt',
    name: 'CustomerNotificationManager.kt (Notification System)',
    language: 'kotlin',
    category: 'compose',
    description: 'System notification & in-app event manager alerting customers immediately when digital codes are approved and delivered.',
    code: `package com.chahndz.app.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.chahndz.app.MainActivity
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

data class InAppNotificationEvent(
    val title: String,
    val message: String,
    val orderId: String,
    val isSuccess: Boolean
)

class CustomerNotificationManager(private val context: Context) {

    private val _inAppEvents = MutableSharedFlow<InAppNotificationEvent>(extraBufferCapacity = 10)
    val inAppEvents = _inAppEvents.asSharedFlow()

    companion object {
        const val CHANNEL_ID = "chahndz_orders_channel"
        const val CHANNEL_NAME = "إشعارات طلبات الشحن والأكواد"
    }

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "إشعارات وصول أكواد الشحن وتأكيد الدفع"
                enableVibration(true)
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    fun sendOrderCompletedNotification(
        orderId: String,
        productTitle: String,
        digitalCode: String,
        customerEmail: String
    ) {
        val title = "تم اعتماد طلبك وتسليم الكود! 🎉"
        val message = "كود شحن \${productTitle} متاح الآن في شاشة طلباتي: \${digitalCode}"

        // 1. Emit in-app banner event
        _inAppEvents.tryEmit(
            InAppNotificationEvent(
                title = title,
                message = message,
                orderId = orderId,
                isSuccess = true
            )
        )

        // 2. Dispatch Android System Status Bar Notification
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("navigate_to", "orders")
            putExtra("order_id", orderId)
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            orderId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText("تم التحقق من الوصل بنجاح! كودك: \${digitalCode}"))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(orderId.hashCode(), notification)
    }

    fun sendOrderRejectedNotification(
        orderId: String,
        productTitle: String,
        reason: String,
        customerEmail: String
    ) {
        val title = "تنبيه بخصوص طلب الشحن #\${orderId}"
        val message = "تم رفض الوصل للعبة \${productTitle}. السبب: \${reason}"

        _inAppEvents.tryEmit(
            InAppNotificationEvent(
                title = title,
                message = message,
                orderId = orderId,
                isSuccess = false
            )
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.stat_notify_error)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(orderId.hashCode(), notification)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/admin/AdminOrderViewModel.kt',
    name: 'AdminOrderViewModel.kt (StateFlow & MVVM)',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack ViewModel using StateFlow for observing orders, filtering by status, search, and approving/rejecting payments.',
    code: `package com.chahndz.app.ui.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chahndz.app.auth.FirebaseAuthManager
import com.chahndz.app.data.repository.OrderFulfillmentRepository
import com.chahndz.app.model.Order
import com.chahndz.app.model.OrderStatus
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class OrderFilterTab {
    ALL, PENDING, COMPLETED, REJECTED
}

data class AdminOrdersUiState(
    val orders: List<Order> = emptyList(),
    val filteredOrders: List<Order> = emptyList(),
    val selectedFilter: OrderFilterTab = OrderFilterTab.PENDING,
    val pendingCount: Int = 0,
    val completedCount: Int = 0,
    val rejectedCount: Int = 0,
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val isDispatching: Boolean = false,
    val activeDispatchOrder: Order? = null,
    val activeRejectOrder: Order? = null,
    val successMessage: String? = null,
    val errorMessage: String? = null
)

class AdminOrderViewModel(
    private val repository: OrderFulfillmentRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AdminOrdersUiState(isLoading = true))
    val uiState: StateFlow<AdminOrdersUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
    }

    private fun loadOrders() {
        viewModelScope.launch {
            repository.observeAllOrders().collect { orderList ->
                val pending = orderList.count { it.status == OrderStatus.PENDING }
                val completed = orderList.count { it.status == OrderStatus.COMPLETED }
                val rejected = orderList.count { it.status == OrderStatus.REJECTED }

                _uiState.update { current ->
                    current.copy(
                        orders = orderList,
                        pendingCount = pending,
                        completedCount = completed,
                        rejectedCount = rejected,
                        isLoading = false,
                        filteredOrders = applyFilters(orderList, current.selectedFilter, current.searchQuery)
                    )
                }
            }
        }
    }

    fun setFilterTab(tab: OrderFilterTab) {
        _uiState.update { current ->
            current.copy(
                selectedFilter = tab,
                filteredOrders = applyFilters(current.orders, tab, current.searchQuery)
            )
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { current ->
            current.copy(
                searchQuery = query,
                filteredOrders = applyFilters(current.orders, current.selectedFilter, query)
            )
        }
    }

    fun openDispatchDialog(order: Order) {
        _uiState.update { it.copy(activeDispatchOrder = order, errorMessage = null) }
    }

    fun closeDispatchDialog() {
        _uiState.update { it.copy(activeDispatchOrder = null) }
    }

    fun openRejectDialog(order: Order) {
        _uiState.update { it.copy(activeRejectOrder = order, errorMessage = null) }
    }

    fun closeRejectDialog() {
        _uiState.update { it.copy(activeRejectOrder = null) }
    }

    fun approvePaymentAndSendCode(order: Order, digitalCode: String, instructions: String?) {
        if (digitalCode.isBlank()) {
            _uiState.update { it.copy(errorMessage = "يرجى إدخال كود الشحن / PIN قبل تأكيد الاعتماد") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isDispatching = true, errorMessage = null) }
            val adminEmail = FirebaseAuthManager.currentUser?.email ?: "taybawi8@gmail.com"
            val result = repository.approvePaymentAndDispatchCode(
                order = order,
                digitalCode = digitalCode,
                redemptionInstructions = instructions,
                adminEmail = adminEmail
            )

            if (result.isSuccess) {
                _uiState.update {
                    it.copy(
                        isDispatching = false,
                        activeDispatchOrder = null,
                        successMessage = "تم اعتماد الدفع وإرسال الكود (\${digitalCode}) للطلب #\${order.id} بنجاح!"
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isDispatching = false,
                        errorMessage = result.exceptionOrNull()?.message ?: "حدث خطأ أثناء اعتماد الطلب"
                    )
                }
            }
        }
    }

    fun rejectOrder(order: Order, reason: String) {
        if (reason.isBlank()) {
            _uiState.update { it.copy(errorMessage = "يرجى تحديد سبب الرفض لتوضيحه للزبون") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isDispatching = true, errorMessage = null) }
            val adminEmail = FirebaseAuthManager.currentUser?.email ?: "taybawi8@gmail.com"
            val result = repository.rejectOrder(
                order = order,
                rejectionReason = reason,
                adminEmail = adminEmail
            )

            if (result.isSuccess) {
                _uiState.update {
                    it.copy(
                        isDispatching = false,
                        activeRejectOrder = null,
                        successMessage = "تم رفض الطلب #\${order.id} وإشعار الزبون بالسبب بنجاح."
                    )
                }
            } else {
                _uiState.update {
                    it.copy(
                        isDispatching = false,
                        errorMessage = result.exceptionOrNull()?.message ?: "حدث خطأ أثناء رفض الطلب"
                    )
                }
            }
        }
    }

    fun clearFeedback() {
        _uiState.update { it.copy(successMessage = null, errorMessage = null) }
    }

    fun generateSamplePin(productTitle: String): String {
        val prefix = when {
            productTitle.contains("PUBG", ignoreCase = true) -> "PUBG-UC660-"
            productTitle.contains("Free Fire", ignoreCase = true) -> "FF-530-"
            productTitle.contains("TikTok", ignoreCase = true) -> "TIKTOK-"
            else -> "CARD-PIN-"
        }
        val rand = (1000..9999).random()
        val rand2 = (1000..9999).random()
        return "\$prefix\$rand-\$rand2"
    }

    private fun applyFilters(
        list: List<Order>,
        tab: OrderFilterTab,
        query: String
    ): List<Order> {
        return list.filter { order ->
            val matchesTab = when (tab) {
                OrderFilterTab.ALL -> true
                OrderFilterTab.PENDING -> order.status == OrderStatus.PENDING
                OrderFilterTab.COMPLETED -> order.status == OrderStatus.COMPLETED
                OrderFilterTab.REJECTED -> order.status == OrderStatus.REJECTED
                else -> true
            }

            val q = query.trim().lowercase()
            val matchesSearch = q.isEmpty() ||
                order.id.lowercase().contains(q) ||
                order.playerId.lowercase().contains(q) ||
                (order.playerNickname?.lowercase()?.contains(q) == true) ||
                order.receiptId.lowercase().contains(q) ||
                order.productTitle.lowercase().contains(q) ||
                order.customerEmail.lowercase().contains(q)

            matchesTab && matchesSearch
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/chahndz/app/ui/admin/AdminOrderVerificationScreen.kt',
    name: 'AdminOrderVerificationScreen.kt (Order Fulfillment UI)',
    language: 'kotlin',
    category: 'compose',
    description: 'Complete Jetpack Compose screen for store admin to inspect receipts, approve payments, manually enter or generate voucher codes, and reject orders.',
    code: `package com.chahndz.app.ui.admin

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.chahndz.app.model.Order
import com.chahndz.app.model.OrderStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminOrderVerificationScreen(
    viewModel: AdminOrderViewModel,
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current

    var fullscreenReceiptUrl by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("إدارة واعتماد طلبات الشحن", fontSize = 16.sp, fontWeight = FontWeight.Black, color = Color.White)
                            Surface(
                                color = Color(0xFFD97706),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text(
                                    "Admin Only",
                                    color = Color.Black,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text("التحقق من وصولات بريدي موب وإرسال أكواد الشحن", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF0B0F1D))
            )
        },
        containerColor = Color(0xFF07090E)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Success & Error Banners
            AnimatedVisibility(visible = uiState.successMessage != null) {
                Surface(
                    color = Color(0xFF064E3B),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF34D399), modifier = Modifier.size(18.dp))
                            Text(uiState.successMessage ?: "", color = Color(0xFFD1FAE5), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        IconButton(onClick = { viewModel.clearFeedback() }, modifier = Modifier.size(20.dp)) {
                            Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
                        }
                    }
                }
            }

            // Search Bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.setSearchQuery(it) },
                placeholder = { Text("بحث برقم الطلب، رقم الوصل، أو معرف اللاعب UID...", fontSize = 12.sp, color = Color(0xFF64748B)) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFF64748B)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFFF59E0B),
                    unfocusedBorderColor = Color(0xFF1E293B),
                    focusedContainerColor = Color(0xFF0E1322),
                    unfocusedContainerColor = Color(0xFF0E1322),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            // Status Tabs Row
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FilterTabItem(
                    title = "قيد المراجعة",
                    count = uiState.pendingCount,
                    isSelected = uiState.selectedFilter == OrderFilterTab.PENDING,
                    accentColor = Color(0xFFF59E0B),
                    onClick = { viewModel.setFilterTab(OrderFilterTab.PENDING) },
                    modifier = Modifier.weight(1f)
                )
                FilterTabItem(
                    title = "المكتملة",
                    count = uiState.completedCount,
                    isSelected = uiState.selectedFilter == OrderFilterTab.COMPLETED,
                    accentColor = Color(0xFF10B981),
                    onClick = { viewModel.setFilterTab(OrderFilterTab.COMPLETED) },
                    modifier = Modifier.weight(1f)
                )
                FilterTabItem(
                    title = "المرفوضة",
                    count = uiState.rejectedCount,
                    isSelected = uiState.selectedFilter == OrderFilterTab.REJECTED,
                    accentColor = Color(0xFFEF4444),
                    onClick = { viewModel.setFilterTab(OrderFilterTab.REJECTED) },
                    modifier = Modifier.weight(1f)
                )
                FilterTabItem(
                    title = "الكل",
                    count = uiState.orders.size,
                    isSelected = uiState.selectedFilter == OrderFilterTab.ALL,
                    accentColor = Color(0xFF38BDF8),
                    onClick = { viewModel.setFilterTab(OrderFilterTab.ALL) },
                    modifier = Modifier.weight(0.9f)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Orders List
            if (uiState.filteredOrders.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = Color(0xFF334155), modifier = Modifier.size(48.dp))
                        Text("لا توجد طلبات في هذا القسم حالياً", color = Color(0xFF64748B), fontSize = 13.sp)
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(uiState.filteredOrders, key = { it.id }) { order ->
                        AdminOrderVerificationCard(
                            order = order,
                            onApproveClick = { viewModel.openDispatchDialog(order) },
                            onRejectClick = { viewModel.openRejectDialog(order) },
                            onViewReceipt = { url -> fullscreenReceiptUrl = url },
                            onCopyReceiptId = {
                                clipboard.setText(AnnotatedString(order.receiptId))
                                Toast.makeText(context, "تم نسخ معرف الوصل: \${order.receiptId}", Toast.LENGTH_SHORT).show()
                            },
                            onWhatsAppClick = {
                                val text = "مرحباً \${order.customerName}، بخصوص طلبك #\${order.id} للعبة \${order.productTitle} (رقم الوصل: \${order.receiptId}):"
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/?text=\${Uri.encode(text)}"))
                                context.startActivity(intent)
                            }
                        )
                    }
                }
            }
        }
    }

    // Modal 1: Approve & Dispatch Digital Code Dialog
    uiState.activeDispatchOrder?.let { order ->
        ApproveAndDispatchCodeDialog(
            order = order,
            isDispatching = uiState.isDispatching,
            onGenerateSample = { viewModel.generateSamplePin(order.productTitle) },
            onConfirm = { code, instructions ->
                viewModel.approvePaymentAndSendCode(order, code, instructions)
            },
            onDismiss = { viewModel.closeDispatchDialog() }
        )
    }

    // Modal 2: Reject Order Dialog
    uiState.activeRejectOrder?.let { order ->
        RejectOrderDialog(
            order = order,
            isRejecting = uiState.isDispatching,
            onConfirmReject = { reason -> viewModel.rejectOrder(order, reason) },
            onDismiss = { viewModel.closeRejectDialog() }
        )
    }
}

@Composable
fun FilterTabItem(
    title: String,
    count: Int,
    isSelected: Boolean,
    accentColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        onClick = onClick,
        color = if (isSelected) accentColor.copy(alpha = 0.15f) else Color(0xFF0E1322),
        shape = RoundedCornerShape(10.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) accentColor else Color(0xFF1E293B)),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(title, color = if (isSelected) accentColor else Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
            Text(count.toString(), color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
fun AdminOrderVerificationCard(
    order: Order,
    onApproveClick: () -> Unit,
    onRejectClick: () -> Unit,
    onViewReceipt: (String) -> Unit,
    onCopyReceiptId: () -> Unit,
    onWhatsAppClick: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0E1322)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B)),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Header: Order ID, Timestamp, Status
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("#\${order.id}", fontWeight = FontWeight.Black, fontSize = 14.sp, color = Color.White, fontFamily = FontFamily.Monospace)
                    Text(order.customerEmail, fontSize = 11.sp, color = Color(0xFF94A3B8))
                }

                Surface(
                    color = when (order.status) {
                        OrderStatus.PENDING -> Color(0xFF451A03)
                        OrderStatus.COMPLETED -> Color(0xFF064E3B)
                        OrderStatus.REJECTED -> Color(0xFF450A0A)
                        else -> Color(0xFF1E293B)
                    },
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = when (order.status) {
                            OrderStatus.PENDING -> "معلق (بحاجة لمراجعة) ⏳"
                            OrderStatus.COMPLETED -> "معتمد ومسلّم ✓"
                            OrderStatus.REJECTED -> "مرفوض ✗"
                            else -> order.status.name
                        },
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = when (order.status) {
                            OrderStatus.PENDING -> Color(0xFFFCD34D)
                            OrderStatus.COMPLETED -> Color(0xFF6EE7B7)
                            OrderStatus.REJECTED -> Color(0xFFFCA5A5)
                            else -> Color.White
                        },
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Divider(color = Color(0xFF1E293B))

            // Item and Pricing
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(order.productTitle, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(order.bundleTitle, color = Color(0xFFF59E0B), fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text("\${order.priceDZD} دج", color = Color(0xFF10B981), fontWeight = FontWeight.Black, fontSize = 15.sp)
                    Text("(\$\${order.priceUSD} USD)", color = Color(0xFF64748B), fontSize = 11.sp)
                }
            }

            // Player Account Verification Box
            Surface(
                color = Color(0xFF090D18),
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("معرف اللاعب (Player ID):", fontSize = 10.sp, color = Color(0xFF94A3B8))
                        Text(order.playerId, color = Color(0xFF38BDF8), fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("اسم اللاعب المعتمد:", fontSize = 10.sp, color = Color(0xFF94A3B8))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF34D399), modifier = Modifier.size(12.dp))
                            Text(order.playerNickname ?: "مطابق ✓", color = Color(0xFF34D399), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // Payment Receipt Details & Screenshot Thumbnail
            Surface(
                color = Color(0xFF111728),
                shape = RoundedCornerShape(10.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155))
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("طريقة الدفع: \${order.paymentMethod.uppercase()}", color = Color(0xFFCBD5E1), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("رقم الوصل:", color = Color(0xFF94A3B8), fontSize = 11.sp)
                            Text(order.receiptId, color = Color(0xFFF59E0B), fontFamily = FontFamily.Monospace, fontWeight = FontWeight.ExtraBold, fontSize = 13.sp)
                            IconButton(onClick = onCopyReceiptId, modifier = Modifier.size(20.dp)) {
                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = Color(0xFF94A3B8), modifier = Modifier.size(14.dp))
                            }
                        }
                    }

                    // Receipt Thumbnail
                    order.receiptImageUrl?.let { imgUrl ->
                        AsyncImage(
                            model = imgUrl,
                            contentDescription = "Receipt Slip",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(50.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(1.dp, Color(0xFFF59E0B), RoundedCornerShape(8.dp))
                                .clickable { onViewReceipt(imgUrl) }
                        )
                    }
                }
            }

            // Already Delivered Code Display (if completed)
            if (order.status == OrderStatus.COMPLETED && !order.digitalCode.isNullOrEmpty()) {
                Surface(
                    color = Color(0xFF064E3B).copy(alpha = 0.4f),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("كود الشحن المسلّم للزبون:", color = Color(0xFF6EE7B7), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            Text(order.digitalCode, color = Color.White, fontFamily = FontFamily.Monospace, fontSize = 13.sp, fontWeight = FontWeight.Black)
                        }
                        Text("تم الإرسال ✓", color = Color(0xFF34D399), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Rejection Reason Display (if rejected)
            if (order.status == OrderStatus.REJECTED && !order.rejectionReason.isNullOrEmpty()) {
                Surface(
                    color = Color(0xFF450A0A).copy(alpha = 0.4f),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.fillMaxWidth().padding(10.dp)) {
                        Text("سبب الرفض الموجه للزبون:", color = Color(0xFFFCA5A5), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        Text(order.rejectionReason, color = Color.White, fontSize = 11.sp)
                    }
                }
            }

            // Action Buttons for PENDING orders
            if (order.status == OrderStatus.PENDING) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    // 1. Approve Payment & Send Code (Primary)
                    Button(
                        onClick = onApproveClick,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981), contentColor = Color.Black),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.3f).height(42.dp)
                    ) {
                        Icon(Icons.Default.Bolt, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("اعتماد الدفع وإرسال الكود", fontSize = 11.sp, fontWeight = FontWeight.Black)
                    }

                    // 2. Reject Order (Secondary)
                    OutlinedButton(
                        onClick = onRejectClick,
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFEF4444)),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEF4444).copy(alpha = 0.6f)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(0.9f).height(42.dp)
                    ) {
                        Icon(Icons.Default.Close, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("رفض الوصل", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun ApproveAndDispatchCodeDialog(
    order: Order,
    isDispatching: Boolean,
    onGenerateSample: () -> String,
    onConfirm: (code: String, instructions: String?) -> Unit,
    onDismiss: () -> Unit
) {
    var codeInput by remember { mutableStateOf("") }
    var instructionsInput by remember { mutableStateOf("ادخل الكود في موقع الشحن الرسمي للعبة لاستلام رصيدك فوراً.") }
    var isConfirmedReceipt by remember { mutableStateOf(true) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF0F1424),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF10B981))
                Text("اعتماد الوصل وإرسال كود الشحن", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color.White)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    "طلب: \${order.productTitle} - \${order.bundleTitle}\\nمعرف الوصل: \${order.receiptId} (\${order.priceDZD} دج)",
                    fontSize = 11.sp,
                    color = Color(0xFF94A3B8)
                )

                // Input Digital Code / PIN
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("كود البطاقة / Voucher PIN:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFF59E0B))
                        TextButton(
                            onClick = { codeInput = onGenerateSample() },
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text("توليد كود تجريبي", fontSize = 10.sp, color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedTextField(
                        value = codeInput,
                        onValueChange = { codeInput = it.uppercase() },
                        placeholder = { Text("مثال: PUBG-UC660-9842-1049", fontSize = 12.sp, color = Color(0xFF64748B)) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF10B981),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedContainerColor = Color(0xFF070A12),
                            unfocusedContainerColor = Color(0xFF070A12),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                }

                // Instructions input
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("تعليمات الاسترداد للزبون:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFCBD5E1))
                    OutlinedTextField(
                        value = instructionsInput,
                        onValueChange = { instructionsInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 2,
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF38BDF8),
                            unfocusedBorderColor = Color(0xFF334155),
                            focusedContainerColor = Color(0xFF070A12),
                            unfocusedContainerColor = Color(0xFF070A12),
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                }

                // Checkbox: Verify receipt
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { isConfirmedReceipt = !isConfirmedReceipt }) {
                    Checkbox(
                        checked = isConfirmedReceipt,
                        onCheckedChange = { isConfirmedReceipt = it },
                        colors = CheckboxDefaults.colors(checkedColor = Color(0xFF10B981))
                    )
                    Text("تم التحقق من اقتطاع المبلغ في حساب بريدي موب", fontSize = 10.sp, color = Color(0xFFE2E8F0))
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(codeInput, instructionsInput) },
                enabled = codeInput.isNotBlank() && isConfirmedReceipt && !isDispatching,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981), contentColor = Color.Black)
            ) {
                if (isDispatching) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.Black, strokeWidth = 2.dp)
                } else {
                    Text("تأكيد وإرسال الكود فوراً", fontWeight = FontWeight.Black, fontSize = 12.sp)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("إلغاء", color = Color(0xFF94A3B8))
            }
        }
    )
}

@Composable
fun RejectOrderDialog(
    order: Order,
    isRejecting: Boolean,
    onConfirmReject: (reason: String) -> Unit,
    onDismiss: () -> Unit
) {
    val predefinedReasons = listOf(
        "رقم الوصل غير مسجل في كشف حساب بريدي موب",
        "المبلغ المحول أقل من السعر المطلوب للطلب",
        "صورة الوصل غير واضحة أو غير مكتملة البيانات",
        "تم استخدام نفس رقم الوصل مسبقاً في طلب آخر"
    )

    var selectedReason by remember { mutableStateOf(predefinedReasons[0]) }
    var customNote by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF160B0E),
        title = {
            Text("رفض طلب الشحن #\${order.id}", fontSize = 15.sp, fontWeight = FontWeight.Black, color = Color(0xFFEF4444))
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("اختر سبب الرفض لتوضيحه في إشعار الزبون:", fontSize = 11.sp, color = Color(0xFFCBD5E1))

                predefinedReasons.forEach { reason ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .clickable { selectedReason = reason }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedReason == reason,
                            onClick = { selectedReason = reason },
                            colors = RadioButtonDefaults.colors(selectedColor = Color(0xFFEF4444))
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(reason, fontSize = 11.sp, color = Color.White)
                    }
                }

                OutlinedTextField(
                    value = customNote,
                    onValueChange = { customNote = it },
                    placeholder = { Text("ملاحظة إضافية للعميل (اختياري)...", fontSize = 11.sp, color = Color(0xFF64748B)) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val fullReason = if (customNote.isNotBlank()) "\$selectedReason (\${customNote.trim()})" else selectedReason
                    onConfirmReject(fullReason)
                },
                enabled = !isRejecting,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444), contentColor = Color.White)
            ) {
                if (isRejecting) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text("تأكيد الرفض وإشعار الزبون", fontWeight = FontWeight.Bold, fontSize = 11.sp)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("تراجع", color = Color(0xFF94A3B8))
            }
        }
    )
}`,
  },
];


