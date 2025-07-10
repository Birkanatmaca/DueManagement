# Yetkilendirme Hatası Yönetimi

Bu projede, kullanıcı hesap bilgileri ile ilgili hatalar geldiğinde kullanıcı otomatik olarak login sayfasına yönlendirilir.

## Nasıl Çalışır?

### 1. API Interceptor
`src/api.js` dosyasında bir Axios interceptor tanımlanmıştır. Bu interceptor tüm API yanıtlarını kontrol eder ve yetkilendirme hatalarını yakalar.

### 2. Tespit Edilen Hata Türleri
Aşağıdaki hata mesajları tespit edildiğinde kullanıcı otomatik olarak login sayfasına yönlendirilir:

- `"Unauthorized"`
- `"Admin only"`
- `"Access denied"`
- `"Token expired"`
- `"Invalid token"`

### 3. Yönlendirme Süreci
1. Yetkilendirme hatası tespit edilir
2. LocalStorage'dan token temizlenir
3. Kullanıcı `/login` sayfasına yönlendirilir
4. Kullanıcı yeniden giriş yapabilir

## Örnek Senaryo

```
API Response: {
  data: {
    message: "Unauthorized Access: Admin only",
    status: "ERROR",
    type: "OK"
  }
}
```

Bu yanıt geldiğinde:
1. Interceptor hatayı yakalar
2. "Unauthorized" ve "Admin only" kelimelerini tespit eder
3. Token'ı temizler
4. Kullanıcıyı login sayfasına yönlendirir

## Avantajlar

- **Otomatik Yönetim**: Her sayfada ayrı ayrı kod yazmaya gerek yok
- **Tutarlılık**: Tüm API çağrılarında aynı davranış
- **Güvenlik**: Geçersiz token'lar otomatik temizlenir
- **Kullanıcı Deneyimi**: Kullanıcı fark etmeden yeniden giriş yapabilir

## Test Etme

Yetkilendirme hatalarını test etmek için:
1. Geçersiz bir token ile API çağrısı yapın
2. Admin olmayan bir kullanıcı ile admin sayfalarına erişmeye çalışın
3. Süresi dolmuş token ile işlem yapmaya çalışın

Bu durumlarda kullanıcı otomatik olarak login sayfasına yönlendirilecektir. 