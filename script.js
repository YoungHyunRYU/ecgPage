function uploadECG() {
  var fileInput = document.getElementById("ecg-file");
  var file = fileInput.files[0];
  var reader = new FileReader();

  // 에러 처리 추가
  reader.onerror = function (event) {
    console.error("File reading error:", event.target.error);
    alert("파일 읽기 오류가 발생했습니다.");
  };

  reader.onload = function (e) {
    try {
      var csvContent = e.target.result;
      // UTF-8 BOM 처리
      if (csvContent.charCodeAt(0) === 0xfeff) {
        csvContent = csvContent.substr(1);
      }

      // 줄바꿈 문자 정규화
      var lines = csvContent.replace(/\r\n/g, "\n").split("\n");

      // 빈 줄 제거
      lines = lines.filter((line) => line.trim() !== "");

      var name = lines[0].split(",")[1].trim();
      var birthdate = lines[1].split(",")[1].trim();
      var recordDate = new Date(lines[2].split(",")[1].trim());

      document.getElementById(
        "user-info"
      ).innerHTML = `이름: ${name} 생년월일: ${birthdate}`;

      var ecgData = parseCSV(lines.slice(13).join("\n"), recordDate);

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
  // 줄바꿈 문자 정규화
  var lines = content.replace(/\r\n/g, '\n').split('\n');
  var ecgData = [];
  var interval = 30000 / lines.length;

  // 데이터 유효성 검사 추가
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

  // 데이터 검증
  if (ecgData.length === 0) {
    console.error('유효한 ECG 데이터가 없습니다');
    return null;
  }

  return ecgData;
}

let ecgChart = null; // 전역 변수로 차트 객체 선언

function renderECGChart(data, startDate) {
  const ctx = document.getElementById("ecgChart").getContext("2d");

  if (ecgChart instanceof Chart) {
    ecgChart.destroy();
  }

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
      maintainAspectRatio: false, // 모바일 화면 대응
      animation: {
        duration: 0, // 성능 개선
      },
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
          ticks: {
            maxRotation: 0, // 모바일에서 레이블 회전 방지
          },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}
