let chart; // Variable to store the Chart instance
const ctx = document.getElementById("myChart");
let currentStock = "AAPL";

// Function to update the chart with new data
// ... (Previous code remains unchanged)

// Function to update the chart with new data
function updateChart(labels, data, label) {
  // Destroy existing chart if needed
  if (chart) {
    chart.destroy();
  }

  // Create a new chart with updated data
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          borderWidth: 1,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
        x: {
          ticks: {
            display: "auto",
            fontSize: 10,
            maxRotation: 200,
            minRotation: 0,
            maxTicksLimit: 10,
            callback: function (value, index, values) {
              return value;
            },
          },
        },
      },
      // ... (Your existing code)

      plugins: {
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            title: function (tooltipItems) {
              const timestampIndex = tooltipItems[0].dataIndex;
              const time = labels[timestampIndex];
              return "Timestamp: " + time;
            },
            label: function (context) {
              const stockName = currentStock;
              const stockPrice = context.parsed.y.toFixed(2);
              return `${stockName} - $${stockPrice}`;
            },
          },
        },
      },

      // ... (Your existing code)

      hover: {
        mode: "index",
        intersect: false,
      },
    },
  });
}

// ... (Rest of the code remains unchanged)




// Function to change the chart data based on time period

function changeChartData(timePeriod) {
  const apiUrl = `https://stocks3.onrender.com/api/stocks/getstocksdata?downloadJSON=true&timePeriod=${timePeriod}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((responseData) => {
      const data = responseData.stocksData[0][currentStock][timePeriod].value;
      const timeStamp = responseData.stocksData[0][currentStock][
        timePeriod
      ].timeStamp.map((timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString()
      );

      // Destroy the existing chart if it exists
      if (chart) {
        chart.destroy();
      }

      console.log(timeStamp);
      updateChart(
        timeStamp,
        Object.values(data),
        `${currentStock} Stock Value (${timePeriod})`
      );
    })
    .catch((error) => console.error("Error fetching data:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  // Rest of the code...

  // Initial chart data load (default: 1 Year)
  changeChartData("1y");

  const stocksDataUrl =
    "https://stocks3.onrender.com/api/stocks/getstockstatsdata";

  // Fetch stocks data
  fetch(stocksDataUrl)
    .then((response) => response.json())
    .then((data) => {
      const stocksStatsData = data.stocksStatsData[0];

      // Create buttons for each stock with additional data
      Object.keys(stocksStatsData).forEach((stock) => {
        if (stock !== "_id") {
          createStockButton(stock, stocksStatsData[stock]);
        }
      });

      // Display stock details for the initial stock (AAPL)
      const additionalData = stocksStatsData["AAPL"];
      const pass = `AAPL $${additionalData.bookValue.toFixed(3)}  ${(
        additionalData.profit * 100
      ).toFixed(2)}%`;
      handleStockButtonClick("AAPL", pass);
    })
    .catch((error) => console.error("Error fetching stocks data:", error));

  // Function to create a button for a stock with additional data
  function createStockButton(stock, additionalData) {
    const buttonsContainer = document.getElementById("buttons-container");
    const button = document.createElement("button");
    button.className = "stock-button";

    // Apply styles to the button
    button.style.color = "black";
    button.style.backgroundImage = "url('blurry-background.jpg')"; // Replace with your blurry background image
    button.style.backgroundSize = "cover"; // Adjust as needed

    // Create a span element to display additional data (bookValue and profit)
    const span = document.createElement("span");
    span.textContent = `$${additionalData.bookValue.toFixed(3)}`;

    // Apply styles to the span
    span.style.color = "white";

    // Check if profit is greater than 0 and set the color accordingly
    if (additionalData.profit > 0) {
      span.style.color = "green";
    } else {
      span.style.color = "red";
    }

    // Append the profit percentage to the span
    span.textContent += ` ${(additionalData.profit * 100).toFixed(2)}%`;

    button.appendChild(document.createTextNode(stock));
    button.appendChild(span);
    const stockHeading = `${stock} $${additionalData.bookValue.toFixed(3)}  ${(
      additionalData.profit * 100
    ).toFixed(2)}%`;

    button.addEventListener("click", () =>
      handleStockButtonClick(stock, stockHeading)
    );
    buttonsContainer.appendChild(button);
  }

  // Function to handle button click for a stock
  // Function to handle button click for a stock
  function handleStockButtonClick(stock, stockHeading) {
    console.log(`Kya bolti ${stockHeading}`);
    currentStock = stock;
    // You can fetch additional data for the selected stock here
    const stockDataUrl = `https://stocks3.onrender.com/api/stocks/getstocksdata?symbol=${stock}&downloadJSON=true`;

    fetch(stockDataUrl)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData.stocksData[0][stock]["1y"]); // Log the data structure
        const data = responseData.stocksData[0][stock]["1y"].value;
        const timeStamp = responseData.stocksData[0][stock]["1y"].timeStamp.map(
          (timestamp) => new Date(timestamp * 1000).toLocaleDateString()
        );

        // Update the chart with the new data
        updateChart(
          timeStamp,
          Object.values(data),
          `${stock} Stock Value (1 Year)`
        );
      })
      .catch((error) =>
        console.error(`Error fetching data for ${stock}:`, error)
      );

    const stockProfileUrl =
      "https://stocks3.onrender.com/api/stocks/getstocksprofiledata";

    fetch(stockProfileUrl)
      .then((response) => response.json())
      .then((data) => {
        const stockProfile = data.stocksProfileData[0][stock];

        // Display stock details below the chart
        displayStockDetails(stockProfile, stockHeading);
      })
      .catch((error) =>
        console.error(`Error fetching stock profile data for ${stock}:`, error)
      );
  }

  function displayStockDetails(stockProfile, stockHeading) {
    const stockDetailsContainer = document.getElementById("stock-details");
    const isZeroPercent = stockHeading.endsWith("0.00%");

    // Determine the color based on the condition
    const textColor = isZeroPercent ? "red" : "green";

    stockDetailsContainer.innerHTML = `
    <h2 style="color: ${textColor}">${stockHeading}</h2>
    <p>${stockProfile.summary}</p>
  `;
  }

  // Function to update the chart with new data (similar to your existing updateChart function)
  // Function to update the chart with new data
  // Function to update the chart with new data
});
