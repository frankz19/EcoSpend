# 🏗️ Arquitectura del Sistema - EcoSpend

Este documento detalla la organización técnica, el flujo de datos y las decisiones de diseño que rigen la aplicación **EcoSpend**.

---

## 1. Visión General de la Arquitectura
EcoSpend utiliza una **Arquitectura en Capas** bajo un enfoque *Offline-First*. La aplicación centraliza la lógica contable y la persistencia en el dispositivo del usuario para garantizar disponibilidad total sin dependencia de red.

### El Modelo de Capas:
1.  **Capa de Presentación (UI/Screens)**: Componentes funcionales de React Native que capturan la interacción del usuario.
2.  **Capa de Servicios (Lógica de Negocio)**: Intermediarios que aplican reglas financieras y validaciones antes de tocar la base de datos.
3.  **Capa de Datos (Persistencia)**: SQLite para datos masivos y SecureStore para datos sensibles.

---

## 2. Flujo de Control Principal (`App.tsx`)
El archivo `App.tsx` actúa como el **cerebro de la aplicación**. Sus responsabilidades incluyen:

*   **Inicialización de Servicios**: Al arrancar, inicializa la base de datos (`initDatabase`), carga las tasas de cambio y solicita permisos de notificación.
*   **Gestión de Sesión**: Orquesta el acceso mediante `SessionService` y los datos biométricos del usuario.
*   **Orquestación de Navegación**: Controla qué pantallas son visibles basándose en el estado de autenticación (`userId`).
*   **Estado Global de Edición**: Centraliza los objetos temporales (`transactionToEdit`, `accountToEdit`, etc.) para permitir que los formularios reutilicen la lógica de creación y actualización.

---

## 3. Lógica de Negocio y Reglas Críticas

### 💱 Gestión Bimoneda
Para manejar la volatilidad económica, el sistema implementa una **Normalización a Moneda Base (USD)**:
1. Las transacciones se registran en su moneda original (VES, COP, EUR).
2. Se captura la **tasa de cambio histórica** en el momento de la transacción.
3. El `CurrencyService` utiliza esta tasa para calcular balances globales y reportes analíticos sin perder la referencia del valor real en el tiempo.

### 🛡️ Integridad de Datos
*   **Transacciones Atómicas**: Las operaciones que afectan múltiples tablas (ej: borrar una cuenta y sus transacciones) se ejecutan mediante transacciones SQL para evitar datos huérfanos.
*   **Categorías de Sistema**: Categorías como "Saldo Inicial" están protegidas contra edición o eliminación para evitar que los balances de las cuentas pierdan su punto de referencia.
*   **Validación de Saldo**: El `TransactionService` impide el registro de gastos que excedan el saldo actual de la cuenta seleccionada.

---

## 4. Diagrama de Comunicación
```mermaid
graph TD
    User([Usuario]) <--> Screens[Capa de Pantallas - UI]
    Screens <--> Services[Capa de Servicios - Lógica]
    Services <--> Utils[Validadores y Helpers]
    Services <--> DB[(SQLite - Datos Contables)]
    Services <--> Secure[(SecureStore - Sesiones y Claves)]
    App[App.tsx] -- Orquesta --> Screens
    App -- Inicializa --> Services