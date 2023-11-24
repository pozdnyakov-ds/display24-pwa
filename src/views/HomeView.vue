<template>
<div 
  class="container" 
  @mouseover="showPanel"
  >
  <div 
    class="content">
      <iframe 
        v-if="settings.dataReady"
        :src="'https://display24.ru/device?code=' + settings.displayCode"
        :style="{ width: '100%', height: '100%' }" 
        scrolling="yes" 
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
                <v-col cols="6" class="data-item">{{ settings.partnerName ? settings.partnerName : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Код дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ settings.displayCode ? settings.displayCode : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Группа дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ settings.displayGroup ? settings.displayGroup : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Наименование дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ settings.displayName ? settings.displayName : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Описание дисплея:</v-col>
                <v-col cols="6" class="data-item">{{ settings.displayDescription ? settings.displayDescription : "-" }}</v-col>
              </v-row>
              <v-row class="data-row">
                <v-col cols="6" class="data-item">Макет:</v-col>
                <v-col cols="6" class="data-item">{{ settings.layoutName ? settings.layoutName : "-" }}</v-col>
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

</div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { v4 as uuidv4 } from "uuid"

const iframeKey = ref(0)
const dialog = ref(false)
const error = ref(null)
const panel = ref(false)
const displayCodeInput = ref(null)
const displayCodeInputRef = ref(null)

const nodeEnv = ref(process.env.NODE_ENV)
const serverPath = process.env.NODE_ENV == 'development' ? 'http://localhost:5000' : 'https://dev116.ru'

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

const showPanel = (event) => {
  if (event.clientY <= 100) {
    panel.value = true
    // setTimeout(() => {
    //   if (!settings.displayCode) {
    //     panel.value = false
    //   }  
    // }, 10000)

  } else {
    panel.value = false
  }
}

const getPartnerLogo = () => {
  if (settings.partnerLogo && settings.partnerLogo.length) {
    return 'https://storage.yandexcloud.net/d24/partners/' + settings.partnerId + '/' + settings.partnerLogo
  } else {  
    return 'img/logo_512.png'
  }              
}

const refreshGo = () => {
  iframeKey.value = uuidv4()
}

const settingsGo = () => {
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
      const response = await fetch(serverPath + '/api/v1/device/' + displayCodeInput.value, {
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
    settings.partnerId = settingsData.partner_id
    settings.partnerName = settingsData.partner_name
    settings.partnerLogo = settingsData.partner_logo && settingsData.partner_logo.filename ? settingsData.partner_logo.filename : null
    settings.displayId = settingsData.display_id
    settings.displayCode = settingsData.display_code
    settings.displayName = settingsData.display_name
    settings.displayDescription = settingsData.display_description
    settings.displayGroup = settingsData.display_group_name
    settings.displayToken = settingsData.display_token
    settings.layoutName = settingsData.layout_name

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
  settings.displayCodeInput = null
  settings.displayName = null
  settings.displayDescription = null
  settings.displayGroup = null
  settings.displayToken = null
  settings.layoutName = null
  settings.dataReady = false
  error.value = null
}

const dialog_save = () => {
  error.value = null
  localStorage.setItem("settings", JSON.stringify(settings))
  dialog.value = false
  settings.dataReady = true
}

const dialog_cancel = () => {
  error.value = null
  dialog.value = false
}

onMounted(() => {
  settingsRestore()
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