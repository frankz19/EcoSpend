# 📱 EcoSpend - Gestión Financiera Inteligente

**EcoSpend** es una aplicación móvil robusta desarrollada con React Native y Expo, diseñada para el control de finanzas personales en entornos bimoneda. La aplicación permite gestionar ingresos y gastos en múltiples divisas (USD, VES, COP, EUR), manteniendo un balance unificado mediante tasas de cambio dinámicas y un sistema de seguridad biométrica.

---

## ✨ Características Principales

### 💰 Gestión Bimoneda y Multicuenta
*   **Soporte Multidivisa**: Configuración de cuentas en USD, VES, COP y EUR.
*   **Tasas de Cambio Dinámicas**: Actualización manual de tasas de cambio directamente desde el Dashboard para reflejar la realidad del mercado.
*   **Balance Unificado**: Cálculo automático del patrimonio total convertido a USD para una visión global del estado financiero.

### 📊 Análisis y Reportes
*   **Reportes Mensuales**: Visualización de gastos e ingresos agrupados por categoría con barras de progreso porcentuales.
*   **Filtros Avanzados**: Consulta de movimientos por mes, tipo de transacción o cuenta específica.
*   **Histórico Preciso**: Las transacciones guardan la tasa de cambio del momento del registro, permitiendo reportes históricos fieles a pesar de la inflación.

### 🔒 Seguridad y Acceso
*   **Autenticación Biométrica**: Acceso rápido mediante Huella Dactilar o FaceID integrado en el flujo de inicio (`App.tsx`).
*   **Persistencia de Sesión**: Uso de `Expo SecureStore` para mantener al usuario conectado de forma segura sin comprometer sus credenciales.
*   **Protección de Rutas**: Un guardián de navegación impide el acceso a datos internos si no se ha validado la identidad del usuario.

### ⏰ Planificación y Control
*   **Recordatorios de Pago**: Programación de alarmas para servicios o deudas con frecuencias personalizables (diaria, semanal, mensual, anual).
*   **Límites de Gasto**: Configuración de presupuestos máximos por categoría con alertas visuales de excedentes.

---

## 🛠️ Stack Tecnológico

*   **Framework**: [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/).
*   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para un desarrollo robusto y tipado.
*   **Base de Datos**: SQLite para persistencia local de datos eficiente.
*   **Seguridad**: `Expo LocalAuthentication` y `Expo SecureStore`.
*   **UI/Icons**: Material Community Icons y React Native Safe Area Context.

---

## 📂 Estructura del Proyecto

```text
EcoSpend/
├── src/
│   ├── assets/             # Recursos visuales
│   ├── data/
│   │   └── database/       # Inicialización y esquemas de SQLite
│   ├── services/           # Lógica de negocio
│   ├── screens/            # Pantallas de la aplicación
│   ├── components/         # Componentes reutilizables de UI
│   └── utils/              # Validadores y formateadores de texto
├── App.tsx                 # Orquestador principal y navegación de estados
├── app.json                # Configuración nativa de Expo
└── package.json            # Dependencias del proyecto

```

*   **`App.tsx`**: El corazón de la aplicación. Orquestador de la navegación, gestión del estado global de autenticación e inicialización de servicios de base de datos y notificaciones.
*   **`/services`**: Lógica de negocio y comunicación con la base de datos (Auth, Accounts, Transactions, Reminders, Categories).
*   **`/screens`**: Pantallas de la interfaz de usuario (Dashboard, Reports, Login, Gestión de Cuentas).
*   **`/utils`**: Validadores de datos, sanitización de texto y lógica de soporte.

---

## 🚀 Instalación y Uso

1.  **Clonar el repositorio**:
    ```bash
    git clone [https://github.com/tu-usuario/ecospend.git](https://github.com/tu-usuario/ecospend.git)
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Iniciar el proyecto**:
    ```bash
    npx expo start
    ```

4.  **Ejecutar en dispositivo**:
    Escanea el código QR con la app **Expo Go** (Android) o la cámara (iOS).

---

## 🛡️ Reglas de Negocio Implementadas

*   **Integridad de Datos**: No se permite la eliminación de categorías de sistema (como "Saldo Inicial") para evitar inconsistencias contables.
*   **Validación de Unicidad**: Control estricto de nombres de categorías y cuentas para evitar duplicados que confundan al usuario.
*   **Eliminación en Cascada**: Al eliminar una cuenta, el sistema limpia automáticamente todas las transacciones asociadas para mantener la base de datos optimizada.

---

## 📝 Licencia
Este proyecto representa una solución integral para la gestión financiera personal, enfocada en la facilidad de uso y la precisión contable en contextos de múltiples divisas.

---
*Desarrollado con ❤️ para el control total de tus finanzas.*