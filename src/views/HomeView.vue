<template>
<div class="container">
  <div class="content">
    <iframe 
      v-if="settings.dataReady"
      :src="'https://display24.ru/device?code=' + settings.displayCode"
      :style="{ width: '100%', height: '100%', borderWidth: '0px' }" 
      scrolling="no" 
      :key="iframeKey">
    </iframe>
  </div>

  <div class="logo" v-if="!settings.dataReady">
    <img
      :src="getPartnerLogo()"
      :alt="settings.partnerName"
      style="width: 250px; margin-bottom: 30px;"
    >
    <div style="font-size: 32pt; margin-bottom: 10px;">Display24</div>
    <div class="logo-no-code">
      Необходимо установить параметры дисплея
    </div>    
  </div>

  <div 
    class="panel-zone" 
    @click="showPanelTemp"
    >
  </div>

  <div class="panel" v-if="panel || !settings.dataReady">
    <v-btn class="btn" @click.prevent="refreshGo">
      <font-awesome-icon icon="fa-solid fa-rotate-right" />
    </v-btn>
    <v-btn class="btn" @click.prevent="settingsGo">
      <font-awesome-icon icon="fa-solid fa-gear" />
    </v-btn>
  </div>

  <v-dialog v-model="dialog" persistent width="500">
        <v-card class="dialog">
            <v-card-text class="text-h6">Настройки приложения</v-card-text>
            <v-row>
              <v-col cols="8">
                <v-text-field
                  ref="displayCodeInputRef"
                  style="margin: 0;"
                  label="Код дисплея"
                  required
                  v-model="displayCodeInput"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-btn color="green-darken-1" variant="tonal" @click="dialog_check">Проверить</v-btn>
              </v-col>
            </v-row>
            <div style="margin: 0 10px 0 10px;">
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Партнер:</v-col>
                <v-col cols="6" class="data-item">{{ partnerNameValue ? partnerNameValue : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Код дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ displayCodeValue ? displayCodeValue : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Группа дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ displayGroupValue ? displayGroupValue : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Наименование дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ displayNameValue ? displayNameValue : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Описание дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ displayDescriptionValue ? displayDescriptionValue : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Макет:</v-col>
                <v-col cols="6" class="data-item">{{ layoutNameValue ? layoutNameValue : "-" }}</v-col>
              </v-row>
            </div>
            <div class="error" v-if="error">Ошибка: {{ error }}</div>
            <v-card-actions class="actions">
                <v-btn class="btn-actions" color="green-darken-1" variant="tonal" @click="dialog_reset">Сбросить</v-btn>
                <v-btn class="btn-actions" color="green-darken-1" variant="tonal" @click="dialog_save">Сохранить</v-btn>
                <v-btn class="btn-actions" color="green-darken-1" variant="tonal" @click="dialog_cancel">Отмена</v-btn>
            </v-card-actions>
        </v-card>
</v-dialog>

<v-dialog v-model="reload" persistent width="350">
  <v-card class="status">
      <v-card-text class="text-h6">Обновление дисплея</v-card-text>
      <div class="status-text">{{ reloadCounter }}</div>
  </v-card>
</v-dialog>

<v-dialog v-model="status" persistent width="350">
  <v-card class="status">
      <v-card-text class="text-h6">Приложение онлайн</v-card-text>
      <div class="status-text">{{ statusCounter }}</div>
  </v-card>
</v-dialog>

</div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { v4 as uuidv4 } from "uuid"

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const iframeKey = ref(0)
const dialog = ref(false)
const error = ref(null)
const panel = ref(false)
const displayCodeInput = ref(null)
const displayCodeInputRef = ref(null)
const firebaseToken = ref(null)
const reload = ref(false)
const status = ref(false)
const reloadCounter = ref(5)
const statusCounter = ref(5)

const partnerIdValue = ref(null)
const partnerNameValue = ref(null)
const partnerLogoValue = ref(null)
const displayIdValue = ref(null)
const displayCodeValue = ref(null)
const displayNameValue = ref(null)
const displayDescriptionValue = ref(null)
const displayGroupValue = ref(null)
const displayTokenValue = ref(null)
const layoutNameValue = ref(null)

//const nodeEnv = ref(import.meta.env.NODE_ENV)
//const serverPath = import.meta.env.NODE_ENV == 'development' ? 'http://localhost:5000' : 'https://dev116.ru'

const settings = reactive({
  partnerId: null,
  partnerName: null,
  partnerLogo: null,
  displayId: null,
  displayCode: null,
  displayCodeInput: null,
  displayName: null,
  displayDescription: null, 
  displayGroup: null,
  displayToken: null,
  layoutName: null, 
  dataReady: false,
})

const counterReload = () => {
  reloadCounter.value = reloadCounter.value - 1
  if (reloadCounter.value > 0) {
    setTimeout(counterReload, 1000)
  } else {
    reload.value = false
    refreshGo()
  } 
}

const counterStatus = () => {
  statusCounter.value = statusCounter.value - 1
  if (statusCounter.value > 0) {
    setTimeout(counterStatus, 1000)
  } else {
    status.value = false
  } 
}

//Firebase init
const firebaseConfig = {     
    apiKey: import.meta.env.VITE_FB_API_KEY,
    projectId: import.meta.env.VITE_FB_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FB_APP_ID,
};
const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

//onMessage
onMessage(messaging, (payload) => {
  console.log('Получено сообщение сервера: ', payload)

  const data = { ...payload.notification, ...payload.data }
  const notificationTitle = data.title
  const notificationOptions = {
      body: data.body,
      icon: data.icon,
      image: data.image,
      click_action: data.click_action,
      requireInteraction: true,
      data
  };
  new Notification(payload.notification.title, payload.notification)

  if (!data || !data.mode) {
    return
  }
  switch (Number(data.mode)) {
    case 1: 
      // Display refresh
      reload.value = true
      reloadCounter.value = 6
      counterReload()
      break
    case 2: 
      // Check status
      status.value = true
      statusCounter.value = 6
      counterStatus()
      break  
  }
})

//requestPermission
function requestPermission() {
  //console.log('Requesting permission...');
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
    }
  })
}

//sendRegistrationToServer
const sendRegistrationToServer = async () => {
  const displayId = settings.displayId
  const token = firebaseToken.value

  const formData = new URLSearchParams();
  formData.append('device_id', displayId);
  formData.append('token', token);

  try {
    const response = await fetch(import.meta.env.VITE_SERVER_PATH + import.meta.env.VITE_ROUTE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
   
    if (!response.ok) {
      throw new Error('Send Registration failed');
    }
    const data = await response.json();
        
  } catch (e) {
    settings.dataReady = false
    return
  }
}

const showPanel = (event) => {
  if (event.clientY <= 100) {
    panel.value = true
  } else {
    panel.value = false
  }
}

const showPanelTemp = (event) => {
  if (!panel.value) {
    panel.value = true
    setTimeout(() => {
      if (settings.displayCode) {
        panel.value = false
      }  
    }, 5000)

  } else {
    panel.value = false
  }
}

const getPartnerLogo = () => {
  if (settings.partnerLogo && settings.partnerLogo.length) {
    return import.meta.env.VITE_S3 + settings.partnerId + '/' + settings.partnerLogo
  } else {  
    return 'img/logo_512.png'
  }              
}

const refreshGo = () => {
  iframeKey.value = uuidv4()
}

const settingsGo = () => {
  partnerNameValue.value = settings.partnerName
  displayCodeValue.value = settings.displayCode
  displayGroupValue.value = settings.displayGroup
  displayNameValue.value = settings.displayName
  displayDescriptionValue.value = settings.displayDescription
  layoutNameValue.value = settings.layoutName

  dialog.value = true
}

const settingsRestore = () => {
  const ls = localStorage.getItem("settings", null) ? JSON.parse(localStorage.getItem("settings", null)) : null
  error.value = null
   
  if (ls) {
    settings.partnerId = ls.partnerId ? ls.partnerId : null
    settings.partnerName = ls.partnerName ? ls.partnerName : null
    settings.partnerLogo = ls.partnerLogo ? ls.partnerLogo : null
    settings.displayId = ls.displayId ? ls.displayId : null
    settings.displayCode = ls.displayCode ? ls.displayCode : null
    settings.displayCodeInput = ls.displayCodeInput ? ls.displayCodeInput : null
    settings.displayName = ls.displayName ? ls.displayName : null
    settings.displayDescription = ls.displayDescription ? ls.displayDescription : null
    settings.displayGroup = ls.displayGroup ? ls.displayGroup : null
    settings.displayToken = ls.displayToken ? ls.displayToken : null
    settings.layoutName = ls.layoutName ? ls.layoutName : null
    settings.dataReady = ls.dataReady ? ls.dataReady : false
    if (settings.displayCode && settings.displayCode.length >= 10) {
      settings.dataReady = true
    }
  }
}

const dialog_check = async () => {
  displayCodeInputRef.value.$el.style = 'border-top: 0px solid green;'
  error.value = null
  var data = null 

  if (!displayCodeInput.value || (displayCodeInput.value && displayCodeInput.value.length < 10)) {
    displayCodeInputRef.value.$el.style = 'border-top: 3px solid orange;'
    error.value = 'Указать код дисплея (10 символов)'
    return
  }

  try {
      const response = await fetch(import.meta.env.VITE_SERVER_PATH + import.meta.env.VITE_ROUTE + displayCodeInput.value, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      })

      if (!response.ok) {
        throw new Error('Request failed');
      }
      data = await response.json();

  } catch (e) {
      error.value = e
      return
  }

  if (data && data.data && data.data.length == 0) {
    error.value = "Код не существует"
    return
  }

  if (data && data.code && data.code == 200 && data.data.length > 0) {
    const settingsData = data.data[0]
    partnerIdValue.value = settingsData.partner_id
    partnerNameValue.value = settingsData.partner_name
    partnerLogoValue.value = settingsData.partner_logo && settingsData.partner_logo.filename ? settingsData.partner_logo.filename : null
    displayIdValue.value = settingsData.display_id
    displayCodeValue.value = settingsData.display_code
    displayNameValue.value = settingsData.display_name
    displayDescriptionValue.value = settingsData.display_description
    displayGroupValue.value = settingsData.display_group_name
    //displayTokenValue.value = settingsData.display_token
    layoutNameValue.value = settingsData.layout_name

    displayCodeInputRef.value.$el.style = 'border-top: 3px solid green;'
    error.value = null

  } else {
    error.value = "Ошибка чтения настроек"
    return
  }
}

const dialog_reset = () => {
  localStorage.removeItem("settings")
  settings.partnerId = null
  settings.partnerName = null
  settings.partnerLogo = null
  settings.displayId = null
  settings.displayCode = null
  displayCodeValue.value = null
  settings.displayCodeInput = null
  settings.displayName = null
  settings.displayDescription = null
  settings.displayGroup = null
  settings.displayToken = null
  settings.layoutName = null
  settings.dataReady = false
  error.value = null

  partnerIdValue.value = null
  partnerNameValue.value = null
  partnerLogoValue.value = null
  displayIdValue.value = null
  displayCodeValue.value = null
  displayNameValue.value = null
  displayDescriptionValue.value = null
  displayGroupValue.value = null
  displayTokenValue.value = null
  layoutNameValue.value = null
}

const dialog_save = () => {
  error.value = null
  dialog.value = false
  
  settings.partnerId = partnerIdValue.value
  settings.partnerName = partnerNameValue.value
  settings.partnerLogo = partnerLogoValue.value

  settings.displayId = displayIdValue.value
  settings.displayCode = displayCodeValue.value
  settings.displayGroup = displayGroupValue.value
  settings.displayName = displayNameValue.value
  settings.displayDescription = displayDescriptionValue.value

  settings.layoutName = layoutNameValue.value
  if (settings.displayCode && settings.displayCode.length == 10) {
    settings.dataReady = true
    sendRegistrationToServer()
  }  
  
  localStorage.setItem("settings", JSON.stringify(settings))
}

const dialog_cancel = () => {
  error.value = null
  dialog.value = false
}

onMounted(() => {
  settingsRestore()

  // Firebase
  requestPermission()

  getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY }).then((currentToken) => {
    if (currentToken) {
      firebaseToken.value = currentToken
      if (settings.dataReady) {
        sendRegistrationToServer()
      }  
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
  });

})

</script>

<style lang="scss" scoped>
.container {
  background-color: #333;
  width: 100%;
  height: 100vh;
  margin: -8px;
  padding: 20px;
  color: #fff;
}
.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; 
  height: 100vh; 
  padding-top: 0px; 
  color: #fff;
  background-color: black;
}
.logo-no-code {
  border: 0px dashed #999;
  border-radius: 20px;
  padding: 20px;
  color: #fff;
  font-size: 14pt; 
}
.logo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%; 
  height: 100vh; 
  padding-top: 0px; 
  color: #fff;
  background-color: black;
}
.panel-zone {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; 
  z-index: 999;
  background-color: transparent;
}
.panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; 
  display: flex; 
  justify-content: end;
  padding: 20px 20px 0 0;
  z-index: 99999;
  color: #fff;
  background-color: transparent;
}
.btn {
  width: 100px !important; 
  height: 100px !important;
  margin: 0 20px 30px 10px;
  border-radius: 100px;
  border: 5px solid #fff;
  box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.25);
  color: #fff;
  background-color: #428CFF;
  font-size: 200%;
  cursor: pointer;
}
.actions {
  display: flex;
  justify-content: end;
  margin: 20px 0 5px 0;
}
.btn-actions {
  margin-left: 15px !important;
}
.dialog {
  margin: 0 20px 30px 0;
  border-radius: 20px !important;
  border: 5px solid #fff;
  box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.25);
  color: #fff;
  background-color: #333;
  font-size: 200%;
  cursor: pointer;
  padding: 0 20px 10px 20px;
  z-index: 9999;
}
.status {
  margin: 0 20px 30px 0;
  border-radius: 20px !important;
  border: 5px solid #fff;
  box-shadow: 0 2px 6px 0 rgb(0, 0, 0, 0.25);
  color: #fff;
  background-color: #428CFF;
  font-size: 200%;
  cursor: pointer;
  padding: 0 20px 10px 20px;
  align-items: center;
}
.status-text {
  color: #fff;
  font-size: 150%;
  width: 100%;
  text-align: center;
}
.data-item {
  font-size: 16px;
}
.error {
  color: orange; 
  width: 100%; 
  text-align: center; 
  margin-top: 20px;
  font-size: 16px;
}
.data-row {
  margin: 0px !important;
}
</style>