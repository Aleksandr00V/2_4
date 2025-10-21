digraph G {
    // Налаштування для всієї діаграми
    graph [
        rankdir=TB, // Змінено з LR (зліва-направо) на TB (зверху-вниз)
        splines=ortho,
        nodesep=0.6,
        ranksep=0.8,
        fontname="Arial"
    ];

    // Налаштування за замовчуванням для вузлів
    node [
        shape=box,
        style="filled,rounded",
        color="#9070FF",
        fillcolor="#F3F0FF",
        fontname="Arial",
        fontsize=10
    ];

    // Налаштування за замовчуванням для стрілок
    edge [
        fontname="Arial",
        fontsize=9,
        color="#444444"
    ];

    // --- Група 1: Початок / Авторизація ---
    subgraph cluster_0_start {
        label = "Початок";
        style="filled,rounded";
        fillcolor="#FAFAFA";
        
        Auth [label="Авторизація (PIN-код)"];
        in_msg [label="ввід_повідомлення", shape=plaintext];
        in_mgr [label="ввід_менеджера", shape=plaintext];

        in_msg -> Auth;
        in_mgr -> Auth;
    }

    // --- Група 2: Основні операції ---
    subgraph cluster_1_operations {
        label = "Процес операцій";
        style="filled,rounded";
        fillcolor="#FAFAFA";

        Select [label="Опрацювання_вибору_клієнта"];
        Cash [label="Обробка_запиту_на_видачу_готівки"];
        Info [label="Обробка_запиту_на_отримання_довідок"];
        Other [label="Інши_послуги"];
        Print [label="Друк"];

        Select -> Cash [label="[PIN-код вірний]"];
        Cash -> Select [label="вибір суми (сума виконана)"];
        
        Select -> Info [label="вибір довідки"];
        Info -> Print [label="довідка сформована"];

        Select -> Other;
    }

    // --- Група 3: Завершення ---
    subgraph cluster_2_end {
        label = "Завершення";
        style="filled,rounded";
        fillcolor="#FAFAFA";
        
        Return [label="Повернення_картки"];
        End [label="Завершення_операцій"];
        in_exit [label="трансакція завершиться", shape=plaintext];

        Return -> End [label="картку_повернуто"];
        in_exit -> End;
    }


    // --- Стрілки, що з'єднують групи ---

    // Авторизація -> Вибір операції
    Auth -> Select [label="можлива трансакція"];
    
    // Невдала авторизація -> Повернення картки
    Auth -> Return [label="при невдалій і... класифікації\nкартки"];

    // Операції -> Повернення картки
    Cash -> Return [label="[кредит погоджено] / \nповідомлення"];
    Info -> Return [label="готівка видана (друк чека\nчи обране)"]; // Цей зв'язок був на оригіналі
    Other -> Return [label="[кредит не погоджений]"];
    Other -> Print [label="готівка видана (обрано\nдрук чека)"]; // Цей зв'язок був на оригіналі
    Print -> Return [label="друк закінчений"];

    // Примусове завершення
    Select -> End [label="завершення трансакції", constraint=false];

}
