Análisis de Arquitectura: Sistema de Gestión de Gastos PersonalesEste documento detalla la descomposición modular para la primera entrega del proyecto, enfocándose en la simulación de un único usuario y el uso de funciones de C para la generación de datos.1. Diagrama de Módulos (Nivel de Sistema)El siguiente diagrama representa la jerarquía de llamadas y la organización de las funcionalidades requeridas:

````mermaid
graph TD
    %% Estilos
    classDef main fill:#f9f,stroke:#333,stroke-width:4px;
    classDef interface fill:#bbf,stroke:#333,stroke-width:2px;
    classDef logic fill:#bfb,stroke:#333,stroke-width:2px;
    classDef utils fill:#fbb,stroke:#333,stroke-width:2px;

    subgraph Aplicación_Principal [Módulo Principal]
        A[main.c]
    end

    subgraph Interfaz_Usuario [Capa de Presentación]
        B[Mostrar Menú]
        C[Mostrar Estadísticas]
    end

    subgraph Gestion_Gastos [Capa de Lógica de Negocio]
        D[Ingresar Presupuesto]
        E[Cargar Gastos]
        F[Obtener Promedio]
        G[Obtener Máximo]
        H[Obtener Mínimo]
    end

    subgraph Herramientas [Capa de Utilidades]
        I[Generar Valor Aleatorio]
    end

    %% Relaciones
    A --> B
    A --> D
    A --> E
    E --> I
    A --> F
    A --> G
    A --> H
    A --> C

    %% Aplicación de clases
    class A main;
    class B,C interface;
    class D,E,F,G,H logic;
    class I utils;
````
2. Definición de MódulosBasado en la descomposición, la estructura del proyecto se divide en tres responsabilidades clave:A. Módulo de InterfazMostrar Menú: Encargado de la navegación y selección de opciones.Mostrar Estadísticas: Formatea y presenta los resultados de los cálculos (Max, Min, Promedio) en pantalla.B. Módulo de Gestión de GastosIngresar Presupuesto: Captura el límite financiero definido por el usuario.Cargar Gastos: Función principal que orquesta el llenado de la estructura de datos (probablemente un arreglo) con los valores simulados.Estadísticas (Máx, Mín, Promedio): Funciones de procesamiento de datos que operan sobre el conjunto de gastos generados.C. Módulo de UtilidadesGenerar Valor Aleatorio: Encapsula el uso de rand() de la librería <stdlib.h> de C para simular los gastos según la consigna.3. Notas para la Implementación en CPara mantener la programación modular, se recomienda:Archivos de Cabecera (.h): Declarar los prototipos de las funciones de cada módulo.Archivos de Código (.c): Implementar la lógica de cada función.Encapsulamiento: El módulo de "Gestión de Usuarios" queda definido pero vacío (o sin llamadas) para cumplir con el alcance de la primera entrega.
