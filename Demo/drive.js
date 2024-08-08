function saveToDrive() {
    const fileContent = JSON.stringify(mangas);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
        name: 'mangas.json',
        mimeType: 'application/json',
    };

    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form,
    }).then((response) => response.json())
      .then((value) => console.log(value))
      .catch((error) => console.error(error));
}

function loadFromDrive() {
    const accessToken = gapi.auth.getToken().access_token;
    fetch('https://www.googleapis.com/drive/v3/files?q=name="mangas.json"&spaces=drive', {
        method: 'GET',
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    }).then((response) => response.json())
      .then((data) => {
          if (data.files && data.files.length > 0) {
              const fileId = data.files[0].id;
              fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                  method: 'GET',
                  headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
              }).then((response) => response.json())
                .then((jsonData) => {
                    mangas = jsonData;
                    actualizarLista();
                })
                .catch((error) => console.error(error));
          } else {
              console.log('No manga file found on Google Drive.');
          }
      })
      .catch((error) => console.error(error));
}
