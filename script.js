function uploadECG() {
  var fileInput = document.getElementById("ecg-file");
  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onerror = function(event) {
    console.error("File reading error:", event.target.error);
    alert("파일 읽기 오류가 발생했습니다.");
  };

  reader.onload = function(e) {
    try {
      var csvContent = e.target.result;
      if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.substr(1);
      }

      var lines = csvContent.replace(/\r\n/g, '\n').split('\n');
      lines = lines.filter(line => line.trim() !== '');

      var name = lines[0].split(",")[1].trim();
      var birthdate = lines[1].split(",")[1].trim();
      var recordDate = new Date(lines[2].split(",")[1].trim());

      document.getElementById("user-info").innerHTML = 
        `이름: ${name} 생년월일: ${birthdate}`;

      var ecgData = parseCSV(lines.slice(13).join("\n"), recordDate);
      console.log('처리된 데이터:', ecgData); // 디버깅용

      if (ecgData && ecgData.length > 0) {
        renderECGChart(ecgData, recordDate);
      } else {
        throw new Error("데이터 변환 실패");
      }
    } catch (error) {
      console.error("Data processing error:", error);
      alert("데이터 처리 중 오류가 발생했습니다.");
    }
  };

  if (file) {
    try {
      reader.readAsText(file);
    } catch (error) {
      console.error("File reading error:", error);
      alert("파일 읽기에 실패했습니다.");
    }
  } else {
    alert("파일을 선택해주세요.");
  }
}

function parseCSV(content, startDate) {
  var lines = content.replace(/\r\n/g, '\n').split('\n');
  var ecgData = [];
  var interval = 30000 / lines.length;

  console.log('데이터 라인 수:', lines.length);

  lines.forEach((line, i) => {
    if (line.trim() !== '') {
      var value = parseFloat(line.trim());
      if (!isNaN(value)) {
        ecgData.push({
          x: new Date(startDate.getTime() + i * interval).getTime(),
          y: value
        });
      }
    }
  });

  console.log('처리된 데이터 수:', ecgData.length);
  return ecgData;
}

function renderECGChart(data, startDate) {
  const canvas = document.getElementById("ecgChart");
  const ctx = canvas.getContext("2d");
  
  canvas.width = canvas.offsetWidth;
  canvas.height = 400;
  
  if (window.ecgChart) {
    window.ecgChart.destroy();
    window.ecgChart = null;
  }
  
  window.ecgChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "ECG Data",
        data: data,
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
        tension: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio,
      animation: false,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        x: {
          type: "time",
          display: true,
          time: {
            unit: "second",
            displayFormats: {
              second: "HH:mm:ss"
            }
          },
          min: startDate.getTime(),
          max: startDate.getTime() + 30000,
          grid: {
            display: true
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            display: true
          }
        }
      }
    }
  });
}
