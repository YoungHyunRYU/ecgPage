function uploadECG() {
  var fileInput = document.getElementById("ecg-file");
  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var csvContent = e.target.result;
    var lines = csvContent.split("\n");
    var name = lines[0].split(",")[1].trim();
    var birthdate = lines[1].split(",")[1].trim();
    var recordDate = new Date(lines[2].split(",")[1].trim());

    document.getElementById(
      "user-info"
    ).innerHTML = `이름: ${name} 생년월일: ${birthdate}`;

    var ecgData = parseCSV(lines.slice(13).join("\n"), recordDate);
    renderECGChart(ecgData, recordDate);
  };

  if (file) {
    reader.readAsText(file);
  } else {
    alert("파일을 선택해주세요.");
  }
}

function parseCSV(content, startDate) {
  var lines = content.split("\n");
  var ecgData = [];
  var interval = 30000 / lines.length;

  lines.forEach((line, i) => {
    var value = parseFloat(line.trim());
    if (!isNaN(value)) {
      ecgData.push({
        x: new Date(startDate.getTime() + i * interval).getTime(),
        y: value,
      });
    }
  });
  return ecgData;
}

let ecgChart = null; // 전역 변수로 차트 객체 선언

function renderECGChart(data, startDate) {
  const ctx = document.getElementById("ecgChart").getContext("2d");

  // 기존 차트가 있다면 제거
  if (ecgChart instanceof Chart) {
    ecgChart.destroy();
  }

  // 새로운 차트 생성
  ecgChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "ECG Data",
          data: data,
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "second",
            displayFormats: {
              second: "HH:mm:ss",
            },
          },
          min: startDate.getTime(),
          max: startDate.getTime() + 30000,
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
