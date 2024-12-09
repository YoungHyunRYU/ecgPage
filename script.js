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
        var lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
        
        // CSV 파일 구조 검증
        if (lines.length < 3) {
            throw new Error("CSV 파일 형식이 올바르지 않습니다");
        }

        // 각 라인이 콤마(,)를 포함하는지 확인
        var nameInfo = lines[0].split(",");
        var birthdateInfo = lines[1].split(",");
        var recordDateInfo = lines[2].split(",");

        if (nameInfo.length < 2 || birthdateInfo.length < 2 || recordDateInfo.length < 2) {
            throw new Error("CSV 파일의 기본 정보 형식이 올바르지 않습니다");
        }

        var name = nameInfo[1].trim();
        var birthdate = birthdateInfo[1].trim();
        var recordDate = new Date(recordDateInfo[1].trim());

        if (!name || !birthdate || isNaN(recordDate.getTime())) {
            throw new Error("기본 정보가 유효하지 않습니다");
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
let ecgChart = null;

function renderECGChart(data, startDate) {
  const canvas = document.getElementById("ecgChart");
  const ctx = canvas.getContext("2d");
  
  // 캔버스 크기 설정
  canvas.width = canvas.offsetWidth;
  canvas.height = 400;
  
  // 기존 차트 제거
  if (window.ecgChart) {
    window.ecgChart.destroy();
    window.ecgChart = null;
  }

  // 새로운 차트 생성
  window.ecgChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [{
        label: "ECG Data",
        data: data,
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        fill: false,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: "time",
          time: {
            unit: "second",
            displayFormats: {
              second: "HH:mm:ss"
            }
          },
          min: startDate.getTime(),
          max: startDate.getTime() + 30000
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}
