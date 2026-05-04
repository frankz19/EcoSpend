# 🧩 Módulos - EcoSpend

Este documento describe las unidades funcionales de la aplicación, agrupando pantallas, servicios y lógica de negocio según su propósito.

---

## 1. Módulo de Autenticación y Seguridad
Gestiona el acceso del usuario y la protección de la información sensible.

*   **Componentes**: `LoginScreen`, `RegisterScreen`, `App.tsx`.
*   **Servicios**: `AuthService`, `SessionService`, `BiometricService`.
*   **Lógica Clave**:
    *   **Cifrado**: Uso de `SecureStore` para persistir el ID del usuario y tokens de sesión.
    *   **Biometría**: Interfaz con hardware (FaceID/Huella) para desbloqueo rápido.
    *   **Fingerprint de Dispositivo**: Vinculación de la sesión al hardware específico para evitar duplicación de datos.

---

## 2. Módulo de Cuentas y Divisas
Administra los "contenedores" de dinero y la lógica de conversión bimoneda.

*   **Componentes**: `AccountsScreen`, `AddAccountScreen`, `DashboardScreen` (Modal de Tasas).
*   **Servicios**: `AccountService`, `CurrencyService`.
*   **Lógica Clave**:
    *   **Multi-Moneda**: Soporte nativo para USD, VES, COP y EUR.
    *   **Tasa de Apertura**: Captura obligatoria de la tasa de cambio al crear cuentas con saldo inicial fuera de USD.
    *   **Balance Global**: Sumarización en tiempo real de todos los saldos convertidos a una moneda base.

---

## 3. Módulo de Transacciones 
El motor que registra los movimientos y asegura la integridad de los saldos.

*   **Componentes**: `TransactionService` (lógica compartida en varias pantallas).
*   **Lógica Clave**:
    *   **Atomicidad**: Uso de transacciones SQL para asegurar que un gasto se registre Y el saldo de la cuenta se actualice simultáneamente.
    *   **Validación de Saldo**: Prevención de saldos negativos mediante chequeos previos a la inserción.
    *   **Reversibilidad**: Lógica inversa para ajustar balances al eliminar o editar transacciones antiguas.

---

## 4. Módulo de Categorías 
Organiza la clasificación de gastos y el control de límites.

*   **Componentes**: `CategoriesScreen`, `AddCategoryScreen`.
*   **Servicios**: `CategoryService`, `ValidationDuplicates`.
*   **Lógica Clave**:
    *   **Presupuesto Mensual**: Comparación de gastos acumulados vs. `limit_amount` definido por el usuario.
    *   **Protección de Sistema**: Bloqueo de edición para categorías raíz (ej. "Saldo Inicial").
    *   **Unicidad**: Validación asíncrona para evitar nombres duplicados mediante normalización de texto (LOWERCASE).

---

## 5. Módulo de Reportes y Análisis
Transforma los datos transaccionales en información visual para la toma de decisiones.

*   **Componentes**: `ReportsScreen`.
*   **Lógica Clave**:
    *   **Agregación SQL**: Consultas con `SUM` y `GROUP BY` para totalizar gastos por categoría.
    *   **Normalización Histórica**: Los reportes recalculan los valores en USD basándose en la tasa de cambio guardada en cada transacción individual, no en la tasa actual.

---

## 6. Módulo de Recordatorios y Notificaciones
Gestiona las obligaciones futuras y la interacción fuera de la app.

*   **Componentes**: `RemindersScreen`, `AddReminderScreen`.
*   **Servicios**: `ReminderService`, `NotificationService`.
*   **Lógica Clave**:
    *   **Recurrencia**: Generación automática del próximo recordatorio (diario, mensual, etc.) al marcar el actual como pagado.
    *   **Programación Local**: Uso de `expo-notifications` para disparar alertas sonoras incluso con la aplicación cerrada.

---

## Resumen de Dependencias entre Módulos

| Módulo | Depende de... |
| :--- | :--- |
| **Reportes** | Transacciones, Categorías, Divisas. |
| **Recordatorios** | Notificaciones. |
| **Transacciones** | Cuentas, Categorías, Divisas. |
| **Autenticación** | Sesión, Almacenamiento Seguro. |

---
