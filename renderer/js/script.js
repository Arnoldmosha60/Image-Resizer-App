const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) => {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertErroMessage('Please select an image');
    return
  }

  // get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = () => {
    widthInput.value = image.width;
    heightInput.value = image.height;
  }
  form.style.display = 'block';
  filename.innerText = file.name;
  
  const outputDir = window.path.join(window.os.homedir(), 'imageresizer');
  outputPath.innerText = outputDir;
}

//send image data to main
const sendImage = (e) => {
  e.preventDefault();

  if (!img.files[0]) {
    alertErroMessage('Please enter an image');
    return;
  }

  const height = heightInput.value;
  const width = widthInput.value;
  const imgPath = img.files[0].path;

  console.log('imgPath:', imgPath);

  if (width === "" || height === "") {
    alertErroMessage("Please fill the width and height");
    return;
  }

  //send to main using ipcrenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height,
  });
}

// catch image:done event
// ipcRenderer.on('image:done', () => {
//   alertSuccessMessage(`Image Resized to ${widthInput.value} x ${heightInput.value}`)
// })

//condition to check if it is image
const isFileImage = (file) => {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

const alertErroMessage = (message) => {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'
    }
  })
}

const alertSuccessMessage = (message) => {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'
    }
  })
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);