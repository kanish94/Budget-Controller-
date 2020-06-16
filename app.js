// Budget controller
const budgetController = (function () {

    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    const calculateTotal = function (type) {

        let sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        });  
        data.totals[type] = sum;    
    };

    return {
        addItem: function (type, des, val) {

            let newItem, ID;

            // Creating new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;          // Adding 1 to the last ID to get current ID
            } else {
                ID = 0;
            }

            // Creating new Item based on type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Pushing item into data structure
            data.allItems[type].push(newItem);

            // Return newItem
            return newItem;
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income - expenses
            data.budget = data.totals['inc'] - data.totals['exp'];

            // Calculate the percentage of income that we spent                      
            if (data.totals['inc'] > 0) {                                              // Otherwise it will show inifnity percentage if income is 0

                data.percentage = Math.round((data.totals['exp'] / data.totals['inc']) * 100);

            } else {

                data.percentage = -1;
            }
            

        },

        getBudget: function () {

            return {
                budget: data.budget,
                totalInc: data.totals['inc'],
                totalExp: data.totals['exp'],
                percentage: data.percentage
            };

        },

        deleteItem: function (type, id) {
            
            let idsArr, index;

            idsArr = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = idsArr.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        }

    };

})();


// UI Controller
const UIController = (function () {

    const DOMstrings = {
        inputType: '.add_type',
        inputDescription: '.add_description',
        inputValue: '.add_value',
        inputBtn: '.add_btn',
        incomeList: '.income_list',
        expenseList: '.expenses_list',
        budgetLabel: '.budget_value',
        incomeLabel: '.budget_income--value',
        expenseLabel: '.budget_expenses--value',
        percentageLabel: '.budget_expenses--percentage',
        container: '.container',
        month: '.budget_title--month'
    };

    const formatNumber = function (num, type) {
        var num, numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3);
        }

        return (type === 'inc' ? '+' : '-') + ' ₹ ' + int + '.' + dec;

    };

    return {

        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)             // Convert string to number

            };
        },

        addListItem: function (obj, type) {

            let html, element;

            if (type === 'inc') {

                element = DOMstrings.incomeList;

                html = `<div class="item clearfix" id="${obj.id}">
                            <div class="item_description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item_value">${formatNumber(obj.value, 'inc')}</div>
                                <div class="item_delete inc">
                                    <button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;

            } else if (type === 'exp') {

                element = DOMstrings.expenseList;

                html = `<div class="item clearfix" id="${obj.id}">
                            <div class="item_description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item_value">${formatNumber(obj.value, 'exp')}</div>
                                <div class="item_delete exp">
                                    <button class="item_delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }

            document.querySelector(element).innerHTML += html;

        },

        clearFields: function () {
            document.querySelector(DOMstrings.inputDescription).value = '';
            document.querySelector(DOMstrings.inputValue).value = '';
            document.querySelector(DOMstrings.inputDescription).focus();                // To focus Description field by default

        },

        displayBudget: function (budget) {

            let type = budget.budget > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budget.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(budget.totalExp, 'exp');

            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = `${budget.percentage}%`;
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
            
        },

        displayMonth: function () {
            let now, year, months, month;

            now = new Date();
            year = now.getFullYear();
            months = ['January', 'Februray', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            document.querySelector(DOMstrings.month).textContent = months[month] + ' ' + year;

        },

        changeColor: function () {
            document.querySelector(DOMstrings.inputType).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputDescription).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputValue).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    }

})();


// Application Controller
const controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = function () {

        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (e) {

            if (e.keyCode === 13 || e.which === 13) {                           // Some browsers do no support keyCode, 13 - Enter key
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIController.changeColor);
    };

    const updateBudget = function () {
        
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        const budget = budgetCtrl.getBudget();

        // Display budget
        UICtrl.displayBudget(budget);

    };

    const ctrlAddItem = function () {

        // 1. Get the field input done
        const input = UICtrl.getInput();
        console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            const newItem = budgetController.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the input fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

        }

    };

    const ctrlDeleteItem = function (e) {

        let type, id;

        if (e.target.parentElement.parentElement.classList.contains('item_delete')) {
            e.target.parentElement.parentElement.parentElement.parentElement.remove();
        }

        if (e.target.parentElement.parentElement.classList.contains('inc')) {
            type = 'inc';
        } else if (e.target.parentElement.parentElement.classList.contains('exp')) {
            type = 'exp';
        }

        id = parseInt(e.target.parentElement.parentElement.parentElement.parentElement.id);

        budgetCtrl.deleteItem(type, id);

        updateBudget();

    }

    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayMonth();            
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });                               // To display all values as 0
        }
    }

})(budgetController, UIController);


controller.init();