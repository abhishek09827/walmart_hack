import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/orebiSlice.js";
import axios from 'axios';
import FormData from 'form-data';
import Cart from "../pages/Cart/Cart.js";
const Webcam = () => {
  const dispatch = useDispatch();
  const vidRef = useRef(null);
  const canvasRef = useRef(null);

  const [media, setMedia] = useState("");
  const [img, setImg] = useState("");

  const startWebCam = async (e) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (vidRef.current) {
        vidRef.current.srcObject = stream;
      }
      setMedia(stream);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  const addCart = ({id, productName, price, img}) =>
    dispatch(
      addToCart({
        _id: id,
        name: productName,
        quantity: 1,
        image: img,
        price: price,
      })
    )



  const stopWebcam = () => {
    if (media) {
      media.getTracks().forEach((track) => {
        track.stop();
      });
      setMedia(null);
    }
  };
  const dataURLToBlob = (dataURL) => {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binaryString = atob(data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
};
  const capImg = async() => {
    if (vidRef.current && canvasRef.current) {
      const vid = vidRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx && vid.videoWidth && vid.videoHeight) {
        canvas.width = vid.videoWidth;
        canvas.height = vid.videoHeight;

        // Draw video frame onto canvas
        ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);

        // Get image data URL from canvas
        const imageDataUrl = canvas.toDataURL("image/jpeg");

        // Set the captured image
        setImg(imageDataUrl);
        console.log(imageDataUrl);
        
        const blob = dataURLToBlob(imageDataUrl);
        
        // Create FormData and append the Blob
        const form = new FormData();
        form.append('image', blob, 'image.jpg');
        
        try {
          const response = await axios.post('http://127.0.0.1:5000/predict', form, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          console.log(response.data.prediction);
          
          addCart({id : Math.random, productName: response.data.prediction,price: "100", img: imageDataUrl})
      } catch (error) {
          console.error('Error:', error);
      }


        // Stop the webcam
        stopWebcam();
      }
    }
  };

  const resetState = () => {
    stopWebcam(); // Stop the webcam if it's active
    setImg(null); // Reset captured image
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {img ? (
        <>
          <img src={img} alt="Captured" className="w-full rounded-lg" />
          <button
            onClick={resetState}
            className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border-none rounded-full px-4 py-2 text-lg shadow-md"
          >
            Reset
          </button>
        </>
      ) : (
        <>
          <video ref={vidRef} autoPlay muted className="w-full rounded-lg" />
          <canvas ref={canvasRef} className="hidden" />
          {!vidRef.current ? (
            <button
              onClick={startWebCam}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border-none rounded-full px-4 py-2 text-lg shadow-md"
            >
              Start Webcam
            </button>
          ) : (
            <button
              onClick={capImg}
              className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border-none rounded-full px-4 py-2 text-lg shadow-md"
            >
              Add to Cart
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Webcam;
