'use strict';
// Progressive enhancement only; DB ownership and booking validation remain server-side.
const form=document.querySelector('[data-booking-form]');
if(form){
 const selected=document.querySelector('[data-selected-seat]');
 const radios=form.querySelectorAll('input[name="seat_id"]');
 for(const radio of radios)radio.addEventListener('change',()=>{if(selected)selected.textContent=radio.dataset.label||'Chưa chọn';});
}
for(const input of document.querySelectorAll('[data-upload]'))input.addEventListener('change',async()=>{
 const label=input.closest('label'),status=label.querySelector('[data-upload-status]'),target=label.querySelector('[data-media-path]'),file=input.files[0];
 if(!file)return;if(file.size>5*1024*1024){status.textContent='Ảnh vượt 5 MB.';return;}
 status.textContent='Đang tải ảnh của bạn lên…';input.disabled=true;
 try{const token=document.querySelector('input[name="_csrf"]').value;const response=await fetch('/admin/upload',{method:'POST',headers:{'Content-Type':file.type,'X-CSRF-Token':token},body:file});if(!response.ok)throw Error('Không tải được ảnh. Kiểm tra quyền, loại ảnh và dung lượng.');const data=await response.json();target.value=data.path;status.textContent='Đã tải ảnh. Bấm Lưu dữ liệu để áp dụng.';}catch(error){status.textContent=error.message;}finally{input.disabled=false;}
});
const scan=document.querySelector('[data-scan-qr]');
if(scan){let stream,stopped=true;const video=document.querySelector('[data-qr-video]'),status=document.querySelector('[data-scan-status]');const stop=()=>{stopped=true;if(stream)for(const track of stream.getTracks())track.stop();video.hidden=true;scan.textContent='Bật camera quét QR';};window.addEventListener('pagehide',stop);scan.addEventListener('click',async()=>{
 if(!stopped){stop();return;}
 if(!('BarcodeDetector' in window)||!navigator.mediaDevices?.getUserMedia){status.textContent='Trình duyệt chưa hỗ trợ quét QR bằng camera. Dùng máy quét USB hoặc dán mã bảo mật trên vé.';return;}
 try{const detector=new BarcodeDetector({formats:['qr_code','code_128']});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});video.srcObject=stream;video.hidden=false;await video.play();stopped=false;scan.textContent='Dừng camera';status.textContent='Đưa mã QR vào camera. Mã đọc được vẫn cần bạn bấm xác nhận.';
 const read=async()=>{if(stopped)return;try{const codes=await detector.detect(video);if(codes.length){document.querySelector('[data-checkin-token]').value=codes[0].rawValue;status.textContent='Đã đọc mã. Bấm xác nhận check-in.';stop();return;}}catch{status.textContent='Chưa đọc được mã, giữ camera ổn định.';}setTimeout(read,350);};read();
 }catch{stop();status.textContent='Không mở được camera hoặc chưa được cấp quyền. Có thể nhập mã thủ công.';}
 });}
