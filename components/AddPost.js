import React from 'react'
import { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil'
import { uploadModal } from '../atoms/uploadModal'
import { generateDownload } from '../utils/cropImage';
import { useSession } from 'next-auth/react';
import { db, storage } from '../firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, increment } from '@firebase/firestore';
import { ref, getDownloadURL, uploadString } from '@firebase/storage';

function AddPost() {
  const { data: session } = useSession();
  const [open,setOpen] = useRecoilState(uploadModal);
  const filePickerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [captionModal, setCaptionModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false)
  const [anim, setAnim] = useState(false);
  if (open) {document.body.style.overflow = 'hidden'}


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, [])

  const addImage = (e) => {
    const reader = new FileReader();
    if(e.target.files[0]){
        reader.readAsDataURL(e.target.files[0])
    }

    reader.onload = (readerEvent) => {
        setSelectedFile(readerEvent.target.result)
    }
  }

  const gotoCaption = async () => {
    const final = await generateDownload(selectedFile, croppedArea);
    final.toBlob(blob => {
        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = (readerEvent) => setCroppedFile(readerEvent.target.result)
    })
    setCaptionModal(true)
  }

  const backToCrop = () => {
      setCroppedFile(null)
      setCaptionModal(false)
  }

  const closeModal = () => {
      document.body.style.overflow = 'scroll'
      setOpen(false)
  }

  const sharePost = async () => {
    setLoading(true);
      if(croppedFile) {
          const docRef = await addDoc(collection(db, 'posts'), {
              userID: session.user.uid,
              username:session.user.username,
              caption: caption,
              profileImg: session.user.image,
              likes: 0,
              comments: 0,
              timestamp: serverTimestamp()
          });
          const imgRef = ref(storage, `posts/${docRef.id}/image`);
          await uploadString(imgRef, croppedFile, "data_url")
          .then(async snapshot => {
              const downloadURL = await getDownloadURL(imgRef)
              await updateDoc(doc(db, 'posts', docRef.id), {
                  image: downloadURL
              })
          })
          const userRef = doc(db, 'users', session.user.uid);
          await updateDoc(userRef, {
              posts: increment(1)
          })
      }
      setLoading(false);
      closeModal();
  }

  return (
    <>
    <div className='fixed top-0 left-0 right-0 bottom-0 bg-black modalBox1 flex items-center justify-center' onClick={closeModal} onLoad={() => {setAnim(true)}}>
        {loading && <div className='w-10 h-10 border-4 border-gray-600 border-t-white rounded-full fixed top-5 fixedCenter animate-spin'></div>}
        <img src="/close.png" alt="" onClick={closeModal} className='fixed top-5 right-5' />
        
    
    {!selectedFile && <div className={`bg-white w-1/2 lg:h-1/2 lg:w-1/3 rounded-xl bringToCenter flex flex-col items-center modalBoxInner1 transition-transform duration-300 scale01 ${anim && 'scale100'}`} onClick={(e) => e.stopPropagation()}>
        <p className='py-2 text-center border-b border-gray-300 w-full'>Create new post</p>
        <img className='mx-auto mt-10' src="/uploadicon.png" alt="" />
        <p className='text-center mt-3 mb-5'>Drag photos and video here</p>
        <button onClick={() => filePickerRef.current.click()} className='bg-blue-500 text-white text-center mx-auto px-3 py-1 rounded-md mb-5'>Select from computer</button>
        <input ref={filePickerRef} onChange={addImage} type="file" className='opacity-0 fixed top-10 w-full bg-red-400 h-full' accept="video/*,image/*"/>
    </div>}
    {selectedFile && !croppedFile && !captionModal && <div className='fixed bg-white top-1/2 left-1/2 w-5/6 md:w-4/5 lg:w-1/3 rounded-xl bringToCenter modalBoxInner' onClick={(e) => e.stopPropagation()}>
        <div className='w-full grid grid-cols-5 px-3'>
            <img onClick={() => setSelectedFile(null)} src="/leftarrow.png" className='w-5 py-3' alt="" />
            <p className='py-2 text-center border-b border-gray-300 w-full col-span-3'>Crop</p>
            <button className='py-2 text-blue-600' onClick={() => gotoCaption()}>next</button>
        </div>
        <div className='relative h-96'>
            <Cropper
            image={selectedFile}
            crop={crop}
            zoom={zoom}
            aspect={1 / 1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            />
        </div>
    </div>}
    {croppedFile && captionModal && <div className={`fixed bg-white top-1/2 left-1/2 w-5/6 md:w-4/5 lg:w-2/3 overflow-hidden rounded-xl bringToCenter modalBoxInner ${loading && 'opacity-50'}`} onClick={(e) => e.stopPropagation()}>
        <div className='w-full grid grid-cols-5 px-3 border-b border-gray-300'>
            <img onClick={backToCrop} src="/leftarrow.png" className='w-5 py-3' alt="" />
            <p className='py-2 text-center w-full col-span-3'>Create new post</p>
            <button className='py-2 text-blue-600' onClick={sharePost}>share</button>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2'>
            <img src={croppedFile} alt="" className='h-full w-full' />
            <div className='px-2 py-2 flex flex-col'>
                <div className='flex space-x-2 items-center'>
                    <img src={session.user.image} alt="" className='w-9 h-9 rounded-full' />
                    <a href="#" className='font-semibold'>{session.user.username}</a>
                </div>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} name="caption" className='flex-1 mt-3 text-sm px-2 focus:outline-none resize-none' placeholder="Write a caption..."></textarea>
            </div>
        </div>
    </div>}
    </div>
    </>
  )
}

export default AddPost