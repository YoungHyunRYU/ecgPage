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
      // 디버깅을 위한 로그 추가
      console.log('CSV 내용:', csvContent.substring(0, 100));

      var lines = csvContent.replace(/\r\n/g, '\n').split('\n');
      console.log('파일 라인 수:', lines.length);

      // 빈 라인 필터링
      lines = lines.filter(line => line.trim() !== '');
      console.log('필터링 후 라인 수:', lines.length);

      // 기본 정보 추출 전 유효성 검사
      if (lines.length < 13) {
        throw new Error("파일 형식이 올바르지 않습니다");
      }

      var name = lines[0].split(",")[1]?.trim() || '';
      var birthdate = lines[1].split(",")[1]?.trim() || '';
      var recordDate = new Date(lines[2].split(",")[1]?.trim() || '');

      if (!name || !birthdate || isNaN(recordDate.getTime())) {
        throw new Error("기본 정보 형식이 올바르지 않습니다");
      }

      document.getElementById("user-info").innerHTML = 
        `이름: ${name} 생년월일: ${birthdate}`;

      var ecgData = parseCSV(lines.slice(13).join("\n"), recordDate);
      
      if (!ecgData || ecgData.length === 0) {
        throw new Error("ECG 데이터를 추출할 수 없습니다");
      }

      console.log('처리된 ECG 데이터 포인트:', ecgData.length);
      renderECGChart(ecgData, recordDate);

    } catch (error) {
      console.error("상세 오류 정보:", error);
      alert(`데이터 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  if (file) {
    try {
      reader.readAsText(file, 'UTF-8');
    } catch (error) {
      console.error("파일 읽기 오류:", error);
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
