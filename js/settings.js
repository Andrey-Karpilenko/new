'use strict';

const settingsDialog = document.getElementById('settings-dialog');

class Settings{
    constructor(){
        document.onkeyup = (event => {
            event.preventDefault();
            if (event.key == 'Escape') this.cancel();
        });
        const theButton = document.querySelectorAll('button');
        for (const button in theButton) {
            if (theButton.hasOwnProperty.call(theButton, button)) {
                const element = theButton[button];
                switch (element.id){
                    case 'open-settings':
                        element.onclick = this.open;
                        break;
                    case 'set-settings':
                        element.onclick = this.close;
                        break;
                    case 'cancel-settings':
                        element.onclick = this.cancel;
                        break;
                }
            }
        }        
    }

    readLocalStorage(){
        let arr = JSON.parse(localStorage.getItem('settings'));
        if (arr!=null) this.populateForm(arr);
    }

    cancel(){
        this.readLocalStorage;
        settingsDialog.close();
    }

    open(){
        document.getElementById('defaultOpen').click();
        this.readLocalStorage;
        settingsDialog.showModal();
    }

    close(){
        let formData = new FormData(settingsForm); //берем данные из формы
        let arr = Array.from(formData); //превращаем их в массив
        localStorage.setItem('settings', JSON.stringify(arr)); // и сохраняем
        settingsDialog.close();
        game.start(); // перезапускаем игру
    }

    populateForm(arr){
        if (arr==null) return;
        for (let item of arr) {
            const name = item[0];
            const el   = settingsForm.elements[name];
            if (el instanceof RadioNodeList) {
                if (el[0].type === 'radio') {
                    el.value = item[1];
                }
            }
            else if (el.type === 'checkbox') {
                if (el.value == item[1]) {
                    el.checked = item[1];
                }
            }
            else {
                el.value = item[1];
            }
        }
    }
}

function openTab(event, tabName) {
    event.preventDefault();
    // Declare all variables
    let i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}
