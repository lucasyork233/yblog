// 计算器彩蛋 - BMI/体脂/跑步配速/单车配速
const CalcEasterEgg = {
  render(app, navigate) {
    app.innerHTML = `
      <div class="page calc-page">
        <div class="calc-container">
          <header class="calc-header">
            <h1 class="calc-title" style="cursor: pointer;" data-tooltip="Back to Home">Calculator</h1>
          </header>

          <div class="calc-cards">
            <!-- BMI & Body Fat Card -->
            <div class="calc-card" id="bmiCard">
              <h3 class="card-title">BMI / Body Fat <span class="refresh-btn" data-card="bmi">↻</span></h3>
              <div class="card-body">
                <div class="input-row">
                  <div class="input-group">
                    <label>Height (cm)</label>
                    <input type="number" id="height" placeholder="170" min="50" max="250">
                  </div>
                  <div class="input-group">
                    <label>Weight (kg)</label>
                    <input type="number" id="weight" placeholder="65" min="20" max="200">
                  </div>
                </div>
                <div class="input-row">
                  <div class="input-group">
                    <label>Age</label>
                    <input type="number" id="age" placeholder="25" min="1" max="120">
                  </div>
                  <div class="input-group">
                    <label>Gender</label>
                    <select id="gender">
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>
                </div>
                <button class="calc-btn" id="calcBmiBtn">Calculate</button>
                <div class="result-area" id="bmiResult"></div>
              </div>
            </div>

            <!-- Running Pace Card -->
            <div class="calc-card" id="runCard">
              <h3 class="card-title">Running Pace <span class="refresh-btn" data-card="run">↻</span></h3>
              <div class="card-body">
                <div class="input-row">
                  <div class="input-group">
                    <label>Pace (min/km)</label>
                    <input type="number" id="runPace" placeholder="4" min="1" max="20" step="0.1">
                  </div>
                </div>
                <div class="input-row">
                  <div class="input-group">
                    <label>Cadence (spm)</label>
                    <input type="number" id="cadence" placeholder="180" min="100" max="250">
                  </div>
                </div>
                <div class="input-row">
                  <div class="input-group">
                    <label>Stride (m)</label>
                    <input type="number" id="stride" placeholder="0.93" min="0.3" max="3" step="0.01">
                  </div>
                </div>
                <button class="calc-btn hidden" id="calcRunBtn">Calculate</button>
                <div class="result-area" id="runResult"></div>
              </div>
            </div>

            <!-- Cycling Speed Card -->
            <div class="calc-card" id="bikeCard">
              <h3 class="card-title">Cycling Speed <span class="refresh-btn" data-card="bike">↻</span></h3>
              <div class="card-body">
                <div class="input-row">
                  <div class="input-group">
                    <label>Wheel Size</label>
                    <select id="wheelSize">
                      <option value="1290">16"</option>
                      <option value="1517">20"</option>
                      <option value="1890">24"</option>
                      <option value="1980">26"</option>
                      <option value="2150">27.5"</option>
                      <option value="2174" selected>700c</option>
                      <option value="2290">29"</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label>Chainring (T)</label>
                    <input type="number" id="chainring" placeholder="50" min="20" max="60">
                  </div>
                </div>
                <div class="input-row">
                  <div class="input-group">
                    <label>Cassette (T)</label>
                    <input type="number" id="cassette" placeholder="11" min="9" max="50">
                  </div>
                  <div class="input-group">
                    <label>Cadence (rpm)</label>
                    <input type="number" id="pedalCadence" placeholder="90" min="30" max="150">
                  </div>
                </div>
                <button class="calc-btn" id="calcBikeBtn">Calculate</button>
                <div class="result-area" id="bikeResult"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    app.querySelector('.calc-title').addEventListener('click', () => {
      navigate('#home');
    });

    this.initCalc();
  },

  initCalc() {
    // 刷新按钮 - 清空各卡片输入
    document.querySelectorAll('.refresh-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cardType = btn.dataset.card;
        if (cardType === 'bmi') {
          document.getElementById('height').value = '';
          document.getElementById('weight').value = '';
          document.getElementById('age').value = '';
          document.getElementById('gender').value = '1';
          document.getElementById('bmiResult').innerHTML = '';
        } else if (cardType === 'run') {
          document.getElementById('runPace').value = '';
          document.getElementById('cadence').value = '';
          document.getElementById('stride').value = '';
          document.getElementById('runResult').innerHTML = '';
        } else if (cardType === 'bike') {
          document.getElementById('wheelSize').value = '2174';
          document.getElementById('chainring').value = '';
          document.getElementById('cassette').value = '';
          document.getElementById('pedalCadence').value = '';
          document.getElementById('bikeResult').innerHTML = '';
        }
      });
    });

    // BMI & 体脂计算
    const calcBmiBtn = document.getElementById('calcBmiBtn');
    calcBmiBtn.addEventListener('click', () => {
      const height = parseFloat(document.getElementById('height').value);
      const weight = parseFloat(document.getElementById('weight').value);
      const age = parseFloat(document.getElementById('age').value);
      const gender = parseFloat(document.getElementById('gender').value);

      if (!height || !weight || !age) {
        document.getElementById('bmiResult').innerHTML = '<span class="error">Please fill all fields</span>';
        return;
      }

      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      const bodyFat = 1.2 * bmi + 0.23 * age - 5.4 - 10.8 * gender;

      let bmiStatus = '';
      if (bmi < 18.5) bmiStatus = 'Underweight';
      else if (bmi < 24) bmiStatus = 'Normal';
      else if (bmi < 28) bmiStatus = 'Overweight';
      else bmiStatus = 'Obese';

      document.getElementById('bmiResult').innerHTML = `
        <div class="result-item"><span>BMI</span><strong>${bmi.toFixed(1)}</strong> <span class="status ${bmiStatus === 'Normal' ? 'good' : ''}">${bmiStatus}</span></div>
        <div class="result-item"><span>Body Fat</span><strong>${bodyFat.toFixed(1)}%</strong></div>
      `;
    });

    // 跑步配速计算 - 固定配速，步频/步幅互算
    const paceInput = document.getElementById('runPace');
    const cadenceInput = document.getElementById('cadence');
    const strideInput = document.getElementById('stride');

    const updateFromCadence = () => {
      const pace = parseFloat(paceInput.value);
      const cadence = parseFloat(cadenceInput.value);

      if (pace && cadence) {
        // 计算步幅: speed = 1000 / (pace * 60), stride = speed / cadence * 60
        const speed = 1000 / (pace * 60); // m/s
        const stride = speed / cadence * 60; // meters
        strideInput.value = stride.toFixed(2);

        document.getElementById('runResult').innerHTML = `
          <div class="result-item"><span>Stride</span><strong>${stride.toFixed(2)} m</strong></div>
          <div class="result-item"><span>Speed</span><strong>${(speed * 3.6).toFixed(1)} km/h</strong></div>
        `;
      }
    };

    const updateFromStride = () => {
      const pace = parseFloat(paceInput.value);
      const stride = parseFloat(strideInput.value);

      if (pace && stride) {
        // 计算步频: speed = 1000 / (pace * 60), cadence = speed / stride * 60
        const speed = 1000 / (pace * 60); // m/s
        const cadence = speed / stride * 60; // spm
        cadenceInput.value = Math.round(cadence);

        document.getElementById('runResult').innerHTML = `
          <div class="result-item"><span>Cadence</span><strong>${Math.round(cadence)} spm</strong></div>
          <div class="result-item"><span>Speed</span><strong>${(speed * 3.6).toFixed(1)} km/h</strong></div>
        `;
      }
    };

    cadenceInput.addEventListener('input', () => {
      updateFromCadence();
    });

    strideInput.addEventListener('input', () => {
      updateFromStride();
    });

    document.getElementById('calcRunBtn').addEventListener('click', () => {
      if (cadenceInput.value) {
        updateFromCadence();
      } else if (strideInput.value) {
        updateFromStride();
      }
    });

    // 单车配速计算
    const calcBikeBtn = document.getElementById('calcBikeBtn');
    calcBikeBtn.addEventListener('click', () => {
      const wheelCircumference = parseFloat(document.getElementById('wheelSize').value);
      const chainring = parseFloat(document.getElementById('chainring').value);
      const cassette = parseFloat(document.getElementById('cassette').value);
      const cadence = parseFloat(document.getElementById('pedalCadence').value);

      if (!wheelCircumference || !chainring || !cassette || !cadence) {
        document.getElementById('bikeResult').innerHTML = '<span class="error">Please fill all fields</span>';
        return;
      }

      const speedMs = wheelCircumference / 1000 * cadence * (chainring / cassette) / 60;
      const speedKmh = speedMs * 3600 / 1000;

      document.getElementById('bikeResult').innerHTML = `
        <div class="result-item"><span>Speed</span><strong>${speedKmh.toFixed(1)} km/h</strong></div>
        <div class="result-item"><span>Speed</span><strong>${speedMs.toFixed(1)} m/s</strong></div>
        <div class="result-item"><span>Gear Ratio</span><strong>${(chainring / cassette).toFixed(2)} : 1</strong></div>
      `;
    });
  }
};

if (typeof window !== 'undefined') {
  window.CalcEasterEgg = CalcEasterEgg;
}
