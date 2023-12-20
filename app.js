let chart;
const ctx = document.getElementById("myChart");
let currentStock = "AAPL";

function updateChart(labels, data, label) {
  if (chart) {
    chart.destroy();
  }

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
      hover: {
        mode: "index",
        intersect: false,
      },
    },
  });
}

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
  changeChartData("1y");

  const stocksDataUrl =
    "https://stocks3.onrender.com/api/stocks/getstockstatsdata";

  fetch(stocksDataUrl)
    .then((response) => response.json())
    .then((data) => {
      const stocksStatsData = data.stocksStatsData[0];

      Object.keys(stocksStatsData).forEach((stock) => {
        if (stock !== "_id") {
          createStockButton(stock, stocksStatsData[stock]);
        }
      });

      const additionalData = stocksStatsData["AAPL"];
      const pass = `AAPL $${additionalData.bookValue.toFixed(3)}  ${(
        additionalData.profit * 100
      ).toFixed(2)}%`;
      handleStockButtonClick("AAPL", pass);
    })
    .catch((error) => console.error("Error fetching stocks data:", error));

  function createStockButton(stock, additionalData) {
    const buttonsContainer = document.getElementById("buttons-container");
    const button = document.createElement("button");
    button.className = "stock-button";

    button.style.color = "black";
    button.style.backgroundImage = "url('blurry-background.jpg')";
    button.style.backgroundSize = "cover";

    const span = document.createElement("span");
    span.textContent = `$${additionalData.bookValue.toFixed(3)}`;

    span.style.color = "white";

    if (additionalData.profit > 0) {
      span.style.color = "green";
    } else {
      span.style.color = "red";
    }

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

  function handleStockButtonClick(stock, stockHeading) {
    console.log(`Kya bolti ${stockHeading}`);
    currentStock = stock;

    const stockDataUrl = `https://stocks3.onrender.com/api/stocks/getstocksdata?symbol=${stock}&downloadJSON=true`;

    fetch(stockDataUrl)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData.stocksData[0][stock]["1y"]);
        const data = responseData.stocksData[0][stock]["1y"].value;
        const timeStamp = responseData.stocksData[0][stock]["1y"].timeStamp.map(
          (timestamp) => new Date(timestamp * 1000).toLocaleDateString()
        );

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
        displayStockDetails(stockProfile, stockHeading);
      })
      .catch((error) =>
        console.error(`Error fetching stock profile data for ${stock}:`, error)
      );
  }

  function displayStockDetails(stockProfile, stockHeading) {
    const stockDetailsContainer = document.getElementById("stock-details");
    const isZeroPercent = stockHeading.endsWith("0.00%");

    const textColor = isZeroPercent ? "red" : "green";

    stockDetailsContainer.innerHTML = `
    <h2 style="color: ${textColor}">${stockHeading}</h2>
    <p>${stockProfile.summary}</p>
  `;
  }
});
