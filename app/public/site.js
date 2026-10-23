'use strict';
// Progressive enhancement only; DB ownership and booking validation remain server-side.
const form=document.querySelector('[data-booking-form]');
if(form){
 const selected=document.querySelector('[data-selected-seat]');
 const radios=form.querySelectorAll('input[name="seat_id"]');
 for(const radio of radios)radio.addEventListener('change',()=>{if(selected)selected.textContent=radio.dataset.label||'Chưa chọn';});
}
