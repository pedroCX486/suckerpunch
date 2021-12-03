import https from 'https';
import SysTray from 'systray';
import * as utils from './utils';

// Hard-forkado do auto-pontomais por @felipechierice no Github.
// Contributors: cx486, Zhokhov, Iago

let users = [
  {
    id: 0,
    username: 'usuario@email.com.br',
    password: 'Su4_S3nh@',
    location_data: {
      latitude: -25.426975,
      longitude: -49.277269,
      address: "Rua Pasteur, 463 - Batel, Curitiba - PR, 80250-104, Brasil",
    },
    schedules: [
      { id: 0, time: '08:00' },
      { id: 1, time: '12:00' },
      { id: 2, time: '13:00' },
      { id: 3, time: '18:00' },
    ],
    allowWeekends: false,
  }
];
var timeouts = [];
let schedulesExecuted = 0;
let totalSchedules = 0;

let timeNow: any;

const systray = new SysTray({
  menu: {
    icon: utils.sysTrayIcon(),
    title: "SuckerPunch Svc Tray",
    tooltip: "SuckerPunch",
    items: [{
      title: "Sair",
      tooltip: "Encerrar SuckerPunch",
      checked: false,
      enabled: true,
    }]
  },
  debug: false,
  copyDir: true,
});

function main() {
  console.log('SuckerPunch - v0.6');
  console.log('Em execução... \n');

  systray.onClick(action => {
    if (action.seq_id === 0) {
      finish();
    }
  });

  updateDate();

  if (!schedulesExecuted) {
    console.log('Lista de Agendamentos:');
    users.forEach((user) => {
      if (!user.allowWeekends && (timeNow.getDay() == 6 || timeNow.getDay() == 0)) {
        console.log(`Configuração do usuário ${user.username} não permite registros em fins de semana!`);
        schedulesExecuted = user.schedules.length;
        return;
      }

      totalSchedules += user.schedules.length;
      user.schedules.forEach((schedules) => {
        scheduler(schedules.time, user.id);
      });
    });
  }

  if (areSchedulesCompleted()) {
    finish();
  }
}

function scheduler(time, userId) {
  const scheduledHour = time.split(':'); //Feio, sim. Mas não me importo. [0] = Hora, [1] = Minuto
  updateDate();

  var eta_ms = new Date(timeNow.getFullYear(), timeNow.getMonth(), timeNow.getDate(), scheduledHour[0], scheduledHour[1]).getTime() - Date.now();

  if (eta_ms < 0) {
    console.log(`Hoje às ${time}: Passou da hora, não será executado. (${users[userId].username})`);
    schedulesExecuted++;
  } else {
    timeouts[userId] = setTimeout(function () {
      executeSchedule(userId);
    }, eta_ms);
  }

  if (!!timeouts[userId]) {
    console.log(`Hoje às ${time}. (${users[userId].username})`);
  }
}

async function executeSchedule(userId) {
  console.log('\nExecutando agendamento:');
  console.log(`Tentando autenticar usuário ${users[userId].username}...`);
  try {
    const auth: any = await authenticateUser(users[userId].username, users[userId].password);
    console.log('Autenticado!');

    console.log('Tentando registrar ponto...');
    try {
      await registrarPonto({
        token: auth.token,
        client: auth.client_id,
        uid: auth.data.email,
        expiry: auth.headers.expiry,
      }, users[userId].location_data);

      console.log('Ponto registrado!');

      schedulesExecuted++;
      console.log(`Total de pontos registrados hoje: ${schedulesExecuted}\n`);

      if (areSchedulesCompleted()) {
        console.log('Último agendamento da lista...\n');
        finish();
      }
    } catch (e) {
      console.log(`Erro ao registrar ponto para usuário ${users[userId].username}...`, e);
    }

  } catch (e) {
    console.log(`Erro ao autenticar usuário ${users[userId].username}...`, e);
  }
}

async function authenticateUser(username, password) {
  const url = 'https://api.pontomais.com.br/api/auth/sign_in';

  const data = JSON.stringify({
    'login': username,
    'password': password,
  });

  const headers = {
    'Host': 'api.pontomais.com.br',
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json, text/plain, */*',
    'Api-Version': 'Api-Version',
    'uuid': '5bf93f59-bd12-4d0d-b96d-f0dd274a1d2d',
    'Origin': 'https://app.pontomaisweb.com.br',
    'Referer': 'https://app.pontomaisweb.com.br/',
  };

  const options = {
    method: 'POST',
    headers: headers,
    timeout: 5000,
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => {
        let resString = JSON.parse(Buffer.concat(body).toString());
        resString.headers = res.headers;
        resolve(resString);
      });
    })

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out!'));
    });

    req.write(data);
    req.end();
  });
}

async function registrarPonto({ token, client, uid, expiry }, location_data) {
  const url = 'https://api.pontomais.com.br/api/time_cards/register';

  const data = JSON.stringify({
    'time_card': {
      'latitude': location_data.latitude,
      'longitude': location_data.longitude,
      'address': location_data.address,
      'reference_id': null,
      'location_edited': false,
      'accuracy': 3374,
    },
    '_path': '/meu_ponto/registro_de_ponto',
    '_device': {
      'browser': {
        'name': 'Chrome',
        'version': '95.0',
        'versionSearchString': 'Chrome',
      }
    },
    '_appVersion': '0.10.32',
  });

  const headers = {
    'Host': 'api.pontomais.com.br',
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'application/json, text/plain, */*',
    'Api-Version': 'Api-Version',
    'uuid': '5bf93f59-bd12-4d0d-b96d-f0dd274a1d2d',
    'Origin': 'https://app.pontomaisweb.com.br',
    'Referer': 'https://app.pontomaisweb.com.br/',
    'access-token': token,
    'token-type': 'Bearer',
    'client': client,
    'expiry': expiry,
    'uid': uid,
  };

  const options = {
    method: 'POST',
    headers: headers,
    timeout: 5000,
  }

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = []
      res.on('data', (chunk) => body.push(chunk));
      res.on('end', () => {
        let resString = JSON.parse(Buffer.concat(body).toString());
        resString.headers = res.headers;
        resolve(resString);
      });
    })

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out!'));
    });

    req.write(data);
    req.end();
  });
}

function updateDate() {
  timeNow = new Date();
}

function areSchedulesCompleted() {
  return schedulesExecuted === totalSchedules;
}

function finish() {
  console.log('\nEncerrando...')
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

main();