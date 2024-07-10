document.getElementById('add-expense').addEventListener('click', addExpense);
document.getElementById('export-excel').addEventListener('click', exportToExcel);

let expenseChart;
let totalBudget = 0;

function addExpense() {
    if (totalBudget === 0) {
        totalBudget = parseFloat(document.getElementById('total-budget').value);
        if (isNaN(totalBudget) || totalBudget <= 0) {
            alert('Please enter a valid total budget.');
            totalBudget = 0;
            return;
        }
    }

    const name = document.getElementById('expense-name').value.toLowerCase();
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (name && amount) {
        const table = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
        let found = false;

        // Iterate through existing rows to find a matching expense name
        for (let i = 0; i < table.rows.length; i++) {
            if (table.rows[i].cells[0].textContent.toLowerCase() === name) {
                // Update the existing row's amount
                const currentAmount = parseFloat(table.rows[i].cells[1].textContent);
                table.rows[i].cells[1].textContent = (currentAmount + amount).toFixed(2);
                found = true;
                break;
            }
        }

        // If no matching expense name is found, add a new row
        if (!found) {
            const newRow = table.insertRow();
            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);

            cell1.textContent = name;
            cell2.textContent = amount.toFixed(2);
            cell3.innerHTML = '<button class="btn-delete" onclick="deleteExpense(this)">Delete</button>';
        }

        document.getElementById('expense-name').value = '';
        document.getElementById('expense-amount').value = '';

        updateTotal();
        updateChart();
    } else {
        alert('Please enter both name and amount');
    }
}

function deleteExpense(btn) {
    const row = btn.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal();
    updateChart();
}

function updateTotal() {
    const table = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
    let total = 0;
    for (let i = 0; i < table.rows.length; i++) {
        total += parseFloat(table.rows[i].cells[1].textContent);
    }
    document.getElementById('total-amount').textContent = total.toFixed(2);
    updateRemainingBudget(total);
}

function updateRemainingBudget(total) {
    const remainingBudget = totalBudget - total;
    document.getElementById('remaining-budget').textContent = remainingBudget.toFixed(2);
}

function updateChart() {
    const table = document.getElementById('expense-table').getElementsByTagName('tbody')[0];
    const labels = [];
    const data = [];

    for (let i = 0; i < table.rows.length; i++) {
        labels.push(table.rows[i].cells[0].textContent);
        data.push(parseFloat(table.rows[i].cells[1].textContent));
    }

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById('expense-chart').getContext('2d');
    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function exportToExcel() {
    const table = document.getElementById('expense-table');
    const wb = XLSX.utils.table_to_book(table, {sheet:"Sheet JS"});
    XLSX.writeFile(wb, 'Expenses.xlsx');
}
