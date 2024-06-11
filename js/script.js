function applyFilter() {
    const selectedCategory = document.getElementById('typePizza').value;
    console.log(selectedCategory);
    fetchJSONData(selectedCategory);
}

function resetFilter() {
   
    document.getElementById('typePizza').value = 'all';
    fetchJSONData('all');
}

function fetchJSONData(selectedCategory = 'all') {
    console.log(`Fetching data for category: ${selectedCategory}`);
    fetch('pizza_data.json')
      .then((res) => {
          if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
      })
      .then((data) => {


        const filteredData =
        selectedCategory === "all"
          ? data
          : data.filter((pizza) => pizza.category === selectedCategory);


        const totalOrders = filteredData.length;
        const totalRevenue = filteredData.reduce((acc, sale) => acc + (parseFloat(sale.price) * parseInt(sale.quantity)), 0);
        const totalTypes = new Set(filteredData.map((sale) => sale.pizza_type_id)).size;
        const numberOfMonths = Object.keys(filteredData.reduce((acc, sale) => {
            const date = new Date(sale.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            acc[key] = (acc[key] || 0) + (parseFloat(sale.price) * parseInt(sale.quantity));
            return acc;
        }, {})).length;
        const averageRevenuePerMonth = totalRevenue / numberOfMonths;


        const sizes = filteredData.reduce((acc, sale) => {
            acc[sale.size] = (acc[sale.size] || 0) + 1;
            return acc;
        }, {});


          const hourlySales = calculateHourlySales(filteredData);


          renderMonthlyChart(filteredData);

          renderHourlyChart(hourlySales);
        

          renderPieChart(Object.keys(sizes), Object.values(sizes));


           renderTopFiveChart(filteredData);


           renderBottomFiveChart(filteredData);

          

          
          document.getElementById('total-order').innerText = totalOrders;
          document.getElementById('total-revenue').innerText = `$${Math.floor(totalRevenue)/1000}K`;
          document.getElementById('total-avg').innerText = `$${Math.floor(averageRevenuePerMonth)/1000}K`;
          document.getElementById('total-types').innerText = totalTypes;
      })
      .catch((error) => console.error("Unable to fetch data:", error));
}

$(document).ready(function () {
    fetch('pizza_data.json')
        .then(response => response.json())
        .then(data => {
            // Batasi data hingga 200 entri
            const limitedData = data.slice(0, 200);

            const table = $('#pizzaTable').DataTable({
                data: limitedData,
                columns: [
                { data: 'order_details_id' },
                { data: 'order_id' },
                { data: 'pizza_id' },
                { data: 'name' },
                { data: 'category' },
                { data: 'ingredients' },
                { data: 'date' },
                { data: 'time' },
                { data: 'price' },
                { data: 'quantity' },
                { data: 'size' }
                ]
            });
        });
});

function renderPieChart(labels, dataCount) {
    const ctx = document.getElementById('size').getContext('2d');
  
    if (window.piePizza) {
        
        window.piePizza.data.labels = labels;
        window.piePizza.data.datasets[0].data = dataCount;
        window.piePizza.update();
    } else {
      
        window.piePizza = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pizza Sold by Size',
                    data: dataCount,
                    backgroundColor: [
                        '#B54200',
                        '#FF5D00',
                        '#FFC69F',
                        '#FF956E',
                        '#FAEED6',
                        '#FF9F40'
                    ],
                    borderWidth: 0
                    
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#3B3B3B', 
                            font: {
                                size: 10
                            },
                            padding: 10
                        }
                    }
                }
            }
        });
    }
}


function renderTopFiveChart(data) {
    
    const salesByPizzaType = data.reduce((acc, sale) => {
        acc[sale.pizza_type_id] = (acc[sale.pizza_type_id] || 0) + parseInt(sale.quantity);
        return acc;
    }, {});

   
    const sortedSales = Object.entries(salesByPizzaType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); 

    const labels = sortedSales.map(([id]) => id);
    const dataCount = sortedSales.map(([, count]) => count);

    const ctx = document.getElementById('top-five').getContext('2d');
    
    if (window.topFivePizza) {
        
        window.topFivePizza.data.labels = labels;
        window.topFivePizza.data.datasets[0].data = dataCount;
        window.topFivePizza.update();
    } else {
        
        window.topFivePizza = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantity',
                    data: dataCount,
                    backgroundColor: [
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y', 
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14,
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}



function renderBottomFiveChart(data) {
    
    const salesByPizzaType = data.reduce((acc, sale) => {
        acc[sale.pizza_type_id] = (acc[sale.pizza_type_id] || 0) + parseInt(sale.quantity);
        return acc;
    }, {});

    
    const sortedSales = Object.entries(salesByPizzaType)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 5); 

    const labels = sortedSales.map(([id]) => id);
    const dataCount = sortedSales.map(([, count]) => count);

    const ctx = document.getElementById('bottom-five').getContext('2d');
    
    if (window.bottomFivePizza) {
        
        window.bottomFivePizza.data.labels = labels;
        window.bottomFivePizza.data.datasets[0].data = dataCount;
        window.bottomFivePizza.update();
    } else {
        
        window.bottomFivePizza = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantity',
                    data: dataCount,
                    backgroundColor: [
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6',
                        '#FAEED6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y', 
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14,
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}



function renderMonthlyChart(data) {
    
    const monthlyQuantities = Array(12).fill(0);

    data.forEach((sale) => {
        const date = new Date(sale.date);
        const monthIndex = date.getMonth();
        const quantity = parseInt(sale.quantity);
        monthlyQuantities[monthIndex] += quantity;
    });

   
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const ctx = document.getElementById('monthly').getContext('2d');

    if (window.monthlyPizza) {
        
        window.monthlyPizza.data.labels = monthLabels;
        window.monthlyPizza.data.datasets[0].data = monthlyQuantities;
        window.monthlyPizza.update();
    } else {
        
        window.monthlyPizza = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Monthly Sales (Quantity)',
                    data: monthlyQuantities,
                    backgroundColor: 'rgba(250, 238, 214, 0.2)',
                    borderColor: '#FAEED6',
                    borderWidth: 1,
                    pointBackgroundColor: '#FAEED6',
                    pointBorderColor: '#FAEED6',
                    pointHoverBackgroundColor: '#B54250',
                    pointHoverBorderColor: '#B54250',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#3B3B3B',
                            fontSize: 14
                        }
                    }
                }
            }
        });
    }
}


function calculateHourlySales(data) {
    
    const hourlyQuantities = Array(24).fill(0);
  
    data.forEach((sale) => {
      const hour = new Date(sale.date + 'T' + sale.time).getHours();
      const quantity = parseInt(sale.quantity);
      hourlyQuantities[hour] += quantity;
    });
  
    return hourlyQuantities;
}

function renderHourlyChart(hourlyQuantities) {
    const ctx = document.getElementById('hourly').getContext('2d');
  
    if (window.hourlyPizza) {
        
        window.hourlyPizza.data.labels = Array.from({ length: 17 }, (_, i) => `${i + 9}:00`); 
        window.hourlyPizza.data.datasets[0].data = hourlyQuantities.slice(9); 
        window.hourlyPizza.update();
    } else {
        
        window.hourlyPizza = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 17 }, (_, i) => `${i + 9}:00`), 
                datasets: [{
                    label: 'Sales by Hour (Quantity)',
                    data: hourlyQuantities.slice(9), 
                    backgroundColor: 'rgba(250, 238, 214, 0.2)',
                    borderColor: '#FAEED6',
                    borderWidth: 1,
                    pointBackgroundColor: '#FAEED6',
                    pointBorderColor: '#FAEED6',
                    pointHoverBackgroundColor: '#B54250',
                    pointHoverBorderColor: '#B54250',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(250, 238, 214, 0.4)'   
                        },
                        ticks: {
                            color: '#333',
                            fontSize: 14
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#3B3B3B',
                            fontSize: 14
                        }
                    }
                }
            }
        });
    }
}



fetchJSONData();
