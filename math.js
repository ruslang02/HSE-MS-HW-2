const z1 = 8731;
const z2 = 1617;
const chiRef = 16.919;

const $ = (a) => document.querySelector(a);
const $all = (a) => document.querySelectorAll(a);

let size = 100;
let seq = [];
let seq1 = [];
let seq2 = [];

$all(".len").forEach(
  (w) =>
    (w.onclick = () => {
      size = w.innerText;

      $all(".len").forEach((v) => {
        if (v.innerText === size.toString()) {
          v.classList.add("active");
        } else {
          v.classList.remove("active");
        }
      });
    })
);

function generateSequence() {
  $("#step1out").innerHTML = "Генерация...";

  seq = new Array(size).fill(0);
  seq[0] = z1;
  seq[1] = z2;

  for (let i = 2; i < size; i++) {
    const number = seq[i - 2] * seq[i - 1];
    seq[i] = (number / 100) % 10000;
  }

  seq = seq.map((x) => Math.round(x) / 10000);

  $(
    "#step1out"
  ).innerHTML = `Последовательность из ${size} элементов создана.<br />Первые 10 элементов: `;
  $("#step1out").innerHTML += seq.slice(0, 10).join(", ");

  createSeqChart();
}

let seqChart;

function createSeqChart() {
  const ctx = $("#seqChart").getContext("2d");
  const barSize = size / 10;
  seq1 = new Array(10)
    .fill(0)
    .map((_v, i) =>
      (
        seq.slice(barSize * i, barSize * (i + 1)).reduce((a, b) => a + b, 0) /
        barSize
      ).toFixed(4)
    );

  ctx.clearRect(0, 0, 1000, 1000);

  if (seqChart) seqChart.destroy();
  if (probChart) probChart.destroy();

  seqChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: new Array(10)
        .fill(0)
        .map((_v, i) => barSize * i + "-" + (barSize * (i + 1) - 1)),
      datasets: [
        {
          label: "Средняя вероятность",
          data: seq1,
          backgroundColor: "#007bff",
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            barPercentage: 1.3,
            ticks: {
              max: 3,
            },
          },
          {
            display: false,
            ticks: {
              autoSkip: false,
              max: 4,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              min: 0,
              max: 1,
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

let probChart;

function createProbChart() {
  const ctx = $("#probChart").getContext("2d");
  seq2 = new Array(10)
    .fill(0)
    .map((_v, i) => [
      0.05 + i * 0.1,
      seq.filter((v) => v >= i / 10 && v < (i + 1) / 10).length,
    ]);

  ctx.clearRect(0, 0, 1000, 1000);

  if (probChart) probChart.destroy();

  probChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: seq2.map(
        ([a, b]) => `${(a - 0.05).toFixed(1)}-${(a + 0.05).toFixed(1)}`
      ),
      datasets: [
        {
          label: "Количество элементов",
          data: seq2.map(([, b]) => b),
          backgroundColor: "#007bff",
        },
      ],
    },
    options: {
      scales: {
        xAxes: [
          {
            barPercentage: 1.3,
            ticks: {
              max: 3,
            },
          },
          {
            display: false,
            ticks: {
              autoSkip: false,
              max: 4,
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

const probtable_head = `<thead>
<tr>
    <th>Интервалы <i>j</i></th>
    <th><i>E<sub>j</sub> = nP<sub>j</sub></i></th>
    <th><i>O<sub>j</sub></i></th>
    <th><i>(O<sub>j</sub> - E<sub>j</sub>)<sup>2</sup> / E<sub>j</sub></i></th>
</tr>
</thead>
<tbody></tbody>`;

function fillProbTable() {
  const out = $("#step2out");
  out.innerHTML = "";

  const table = $("#step2table");
  table.innerHTML = probtable_head;

  const tbody = $("#step2table tbody");

  const estAvg = seq.length / seq2.length;
  const stat = seq2.map(([, ni]) => ((ni - estAvg) * (ni - estAvg)) / estAvg);
  const statSum = stat.reduce((a, b) => a + b, 0);

  tbody.innerHTML = seq2
    .map(
      ([xi, ni], i) => `<tr>
    <td>${(xi - 0.05).toFixed(2) + " - " + (xi + 0.05).toFixed(2)}</td>
    <td>${estAvg.toFixed(2)}
    <td>${ni.toFixed(0)}</td>
    <td>${stat[i].toFixed(4)}</td>
    </tr>`
    )
    .join("");

  tbody.innerHTML += `<tr>
    <td><b>Сумма</b></td>
    <td></td>
    <td><b>${size}</b></td>
    <td><b>${statSum.toFixed(2)}</b></td>
    </tr>`;

  out.innerHTML = `&chi;<sup>2</sup> = ${statSum}`;
  if (statSum <= chiRef) {
    out.innerHTML += ` <= ${chiRef}.<br />Значит, данное распределение <b>можно</b> считать равномерно распределенным при уровне значимости 0.05.`;
  } else {
    out.innerHTML += ` > ${chiRef}.<br />Значит, данное распределение <b>нельзя</b> считать равномерно распределенным при уровне значимости 0.05.`;
  }
}

const permuttable_head = `<thead>
<tr>
    <th>Вариант <i>j</i></th>
    <th><i>E<sub>j</sub> = nP<sub>j</sub></i></th>
    <th><i>O<sub>j</sub></i></th>
    <th><i>(O<sub>j</sub> - E<sub>j</sub>)<sup>2</sup> / E<sub>j</sub></i></th>
</tr>
</thead>
<tbody></tbody>`;

const threeMap = new Map([
  [27, "1-2-3"],
  [39, "2-1-3"],
  [57, "3-2-1"],
  [30, "1-3-2"],
  [45, "2-3-1"],
  [54, "3-1-2"],
]);

/** 01 10 11
 **  1- 2- 3
 * 01_10_11 = 27  10_01_11 = 39
 * 11_10_01 = 57  01_11_10 = 30
 * 10_11_01 = 45  11_01_10 = 54
 */
const rank = (arr) => {
  let [a, b, c] = arr.sort((a, b) => a - b);
  return arr
    .map((v) =>
      v === a ? (a = -1) && 1 : v === b ? (b = -1) && 2 : (c = -1) && 3
    )
    .map((v, i) => v << ((2 - i) * 2))
    .reduce((a, b) => a + b, 0);
};

function fillPermutTable() {
  const out = $("#step3out");
  out.innerHTML = "";

  const table = $("#step3table");
  table.innerHTML = permuttable_head;

  const tbody = $("#step3table tbody");

  const estAvg = (size - 1) / 6;

  const seqs = new Array(Math.floor(size / 3))
    .fill(0)
    .map((_v, i) => seq.slice(i * 3, i * 3 + 3))
    .map(rank);


  const variants = [27, 57, 45, 39, 30, 54].map((r) => {
    return [r, seqs.filter((_) => _ == r).length];
  });


  const stat = variants.map(
    ([, ni]) => ((ni - estAvg) * (ni - estAvg)) / estAvg
  );
  const statSum = stat.reduce((a, b) => a + b, 0);

  tbody.innerHTML = variants
    .map(
      ([v, n], i) => `<tr>
    <td>${threeMap.get(v)}</td>
    <td>${estAvg.toFixed(2)}</td>
    <td>${n}</td>
    <td>${stat[i].toFixed(4)}</td>
    </tr>`
    )

    .join("");

  tbody.innerHTML += `<tr>
      <td><b>Сумма</b></td>
      <td></td>
      <td><b>${seqs.length}</b></td>
      <td><b>${statSum.toFixed(2)}</b></td>
      </tr>`;

  out.innerHTML = `&chi;<sup>2</sup> = ${statSum}`;
  if (statSum <= chiRef) {
    out.innerHTML += ` <= ${chiRef}.<br />Значит, тройки в данной последовательности <b>распределены равномерно</b>.`;
  } else {
    out.innerHTML += ` > ${chiRef}.<br />Значит, тройки в данной последовательности <b>распределены не равномерно</b>.`;
  }
}

function runAll() {
  generateSequence();
  createSeqChart();
  createProbChart();
  fillProbTable();
  fillPermutTable();
}
