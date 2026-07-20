Home Page 
1. Home Page - Video create - banner 

2. Whatsapp original logo 
3. FAQ copy from jewell box 
4. Life time exchange remove from entire website 
5. why choose TBA section - add a point of Highly customization as per customer and remove      lifetime exchange point
6. remove logo from banner images 
7. animate the prime collection option  - Home Page - The animation would be - as someone clicks on the plus button one line will go from ring to the box in animated and the box will open in the right side
8. announcement section - copy from JewellBox 
9. increase the font size in live rate 
10. change the stats section entirely
11. change the photo in show location section 

12. the logo and content is wrong in why choose us 

Product Details page 
1. Initially 25 product will be visible - each categories 5 products - without login
   and if person login then only he can see all the products 
2. Jewel box = copy - product details page & filter & sort options 
3. share option on product details page
4. Color order Yellow, White, Rose
5. the certificate and hallmark will not come on product details page 

Catalog Page 
1. Carousel in product display - automatic in every product 
2. Filter remove option of karat filtration complete 
3. one each product all th karat option should be visible 

Entire website - 
1. no lagging on the website 
2. each image should be load fast 
3. Highlight in the website in the text 
4. https://www.semrush.com/analytics/keywordoverview/?q=jewelbox&db=in - check this out and find similar websites which rank at top

Backend - 
1. if order is more than 10 products then the admin should be able to download the excel sheet of that order
2. IP address access of customer 


Backend Order:
User Model + DB Connection + Server Setup
Auth APIs (Signup, Login, Forgot/Reset Password, JWT + Refresh Token)
JWT Middleware + Role-based Auth (User/Admin)
User Profile + Address APIs
Wishlist APIs
Cart APIs
Coupon APIs (Admin create/manage + User apply)
Checkout Preparation
Banner + Announcement APIs
Admin User Management


Meeting - 
1. Check all the changes 
2. Buy hosting 
3. Razorpay Registration 
4. Confirm Product Model
5. Banner video creation 
6. Category List 
7. 5 Products from each Category 
8. Coupon system - for example a coupon should be applied on all products or on a specific conditions only or on a specific product only 


Razorpay Registration Required Documents

1. If the Business is a Sole Proprietorship
* GST Certificate
* Shops & Establishments Certificate (Shop Act License)
* Trade License
* VAT Registration
* TIN Registration
* Sales Tax Registration

Bank Account Proof (Any One Required)
* Current Account Bank Statement (last 3 months)
* Cancelled Cheque
* First page of the settlement bank account statement/passbook

Owner's Personal Documents (Required)
* Owner's PAN Card
* Any one Government-approved Identity & Address Proof:
  * Aadhaar Card
  * Voter ID Card
  * Driving License
  * Passport
---

2. If the Business is a Partnership Firm

Business Documents (Required)
* Registered Partnership Deed (Mandatory)
* Partnership Firm PAN Card

Additional Business Registration (Any One Required)
* GST Certificate
* Shops & Establishments Certificate (Shop Act License)
* Trade License
* VAT Registration
* TIN Registration
* Sales Tax Registration

Partnership Firm Bank Account Proof (Any One Required)
* Current Account Bank Statement (last 3 months)
* Cancelled Cheque
* First page of the settlement bank account statement/passbook

Authorized Signatory / Partner Personal Documents (Required)
* Authorized Signatory's PAN Card
* Any one Government-approved Identity & Address Proof:
  * Aadhaar Card
  * Voter ID Card
  * Driving License
  * Passport

Important:
* The PAN Card and Identity/Address Proof should belong to the same Authorized Signatory.
---

## Quick Summary

For Sole Proprietorship:
* Business proof document
* Business bank account proof
* Owner's PAN Card
* Owner's Identity & Address Proof

For Partnership Firm:
* Registered Partnership Deed
* Firm PAN Card
* Business registration proof
* Partnership firm's bank account proof
* Authorized Partner's PAN Card
* Authorized Partner's Identity & Address Proof



Product Model - 
https://jewelbox.co.in/twisted-curtsy-padma-cut-diamond-ring/

Basic Info:
  name = "Twisted Curtsy Padma Cut Diamond Ring"
  slug (unique) = (URL) twisted-curtsy-padma-cut-diamond-ring
  sku (unique) = WRI201109YG10100
  shortDescription =  
  Grace meets grandeur in the Twisted Curtsy Padma Cut Diamond Ring, a striking solitaire piece that celebrates bold individuality. At its heart lies a rare Padma-cut lab-grown diamond, set in a graceful twist of precious metal that symbolises unity and movement. With its brilliance and sculptural form, this statement ring is ideal for milestone moments, engagements, or simply indulging in a showstopping piece of wearable art. A solitaire that doesn’t whisper, it shines, unapologetically.
  categories: [String]   ← ["Rings", "Solitaire Rings", "Engagement Rings"]
  tags: [String]         ← ["Anniversary", "Big Solitaires", "Engagement"]
  collection: String     ← "Padma Signature Cut"
  isActive
  isFeatured

Pricing:
  basePrice (Number)
  priceExcludesTax (Boolean)
  priceBreakup: [{ label, amount }]

Variants:
  colors: [{ label, dot }]
  defaultColor
  metalOptions: [String]
  defaultMetal
  ringSizes: [Number]
  defaultRingSize

Weight & Purity:
  weightGross = Total jewellery weight (gold + diamond + everything)
  weightNet   = Sirf gold ka weight
  purity      = Gold purity (e.g. "14Kt Gold Yellow")

Diamonds:
  diamondSummary: { totalWeight, totalCount }
  diamonds: [{
    shape → ref: DiamondShape
    count, totalWeight, color, clarity, sizeRange
  }]

otherStones: [{      - if need to add other stones    
  name
  count
  totalWeight
}]

Media:
  media: [{
    type (image | video)
    url, alt         ← image only
    youtubeId, thumbnail  ← video only
  }]

SEO:
  metaTitle
  metaDescription

Timestamps: createdAt, updatedAt

Ready To Ship:
  readyToShip: [{
    imageUrl, price, sku
    metalWeight, diamondWeight
    purity, ringSize
  }]



  Bracelet 

IGI - IMP
SGL
GCI Certificate

  

Theek hai, poora scope final order me laga deta hu — teri logic sahi hai (jo already integrated hai use pehle test karo, phir jo backend hai par frontend nahi, phir jo dono missing hai).

## PHASE 1 — Testing (jo already backend+frontend dono wired hai)

Ye sab already connected hai, ab sirf end-to-end test karna hai (real use jaisa — signup se leke checkout summary tak):

1. Auth — register, login, logout, refresh, forgot/reset password, Google login, Facebook login
2. Profile management (update name/phone, change password)
3. Address management (add/edit/delete/set default)
4. Cart (add/update qty/remove/clear)
5. Wishlist (add/remove)
6. Banners (homepage display)
7. Announcements (display)
8. Coupon apply/remove (checkout ke andar)
9. Checkout summary (cart+coupon+total calculation sahi aa raha hai ya nahi)

Isme bugs milna normal hai — jaise edge cases (empty cart, invalid coupon, expired coupon, wrong OTP jaisi cheezein) miss ho sakti hai. Ye phase pehle isliye kyunki agar foundation (auth/cart) me hi bug hai, toh upar wala kuch bhi test karna waste hoga.

## PHASE 2 — Backend complete, Frontend baaki

1. **Admin Panel (poora)** — backend me banner/announcement/coupon/user-management CRUD sab bana hai (`admin.routes.js`, `admin.auth.controller.js`, `admin.user.controller.js`), par client folder me koi admin UI hai hi nahi. Ye bada gap hai — abhi client (Danyaal/jo bhi) content update nahi kar sakta bina developer ke.

## PHASE 3 — Dono (backend + frontend) baaki — priority order me

1. **Gold Pricing — security fix + proper backend routing** (sabse pehle, kyunki chhota kaam hai aur abhi live security bug hai — API key frontend me exposed hai). Backend me fetch+store+serve karna, frontend sirf stored value use kare.
2. **Categories — hardcoded se schema me** (Product jaisa hi treatment, chhota schema + admin CRUD + frontend fetch)
3. **Order model + Place Order API** (backend) — ye sabse critical hai, checkout ka core
4. **Razorpay integration** (Order ke saath hi, payment success/failure handle karna)
5. **OrderConfirmation page ko real order data se connect karna** (abhi pura hardcoded/mock hai — `TBA-8492041`, `Eleanor Vance` jaisa fake data hata ke actual order object use karna)
6. **Order history + tracking view** (customer apna order dekh sake)
7. **Production tracking stages** (admin update + customer status view — Order model ka extension)
8. **Reviews** (submit + display + admin moderation)
9. **OTP authentication** (agar rakhna hai — abhi tak implement hi nahi hua)
10. **WhatsApp cart-reminder** (sabse aakhir, launch-blocking nahi hai)

**Logic yahi hai**: Testing pehle taaki foundation pe bharosa ho, phir Admin Panel (kyunki bina iske content hi client khud manage nahi kar sakta — launch ke liye zaroori hai), phir Order→Razorpay→Tracking wala poora payment chain (business-critical), phir Reviews/OTP/WhatsApp (nice-to-have, launch ke baad bhi add ho sakte hai).

Hosting purchase krna baki hai and Razorpay setup is left






### Coupon Scope UI
- [ ] Naya coupon banate waqt "Applies to: All / Category / Specific Product" dropdown dikhe
- [ ] "Category" select karne pe category-picker aaye (dynamic list se)
- [ ] "Product" select karne pe product-picker aaye (dynamic list se, search karke dhoondh sake)
- [ ] Bana hua scoped coupon list me sahi scope ke saath dikhe

### Banner — 3 Slot Redesign
- [ ] Sirf 3 fixed slots dikhein, har ek me sirf upload button + order — koi "Image URL" text field na ho
- [ ] Teeno slot fill karke homepage pe sahi order me dikhein

### Reviews Moderation
- [ ] Pending reviews ki list dikhe
- [ ] Approve/Reject/Delete teeno buttons kaam karein

### Order Management (agar admin side banaya)
- [ ] Admin sabhi orders dekh sake (customer-wise nahi, sabke)
- [ ] Payment status aur order status sahi dikhein


GST - 3%
Making charges - 850 * gross weight 
dimaond - 



Changes - 
1. If product is removed from Wishlist - the heart should be removed immediately from all pages on that product - curretnly it goes on relaod - it should be instanly 


# TBA — The Brilliance Atelier — Full Testing Checklist (Phase 1, 2 & 3)

---

## PHASE 1 — Customer-facing testing

### 1. Auth
- [✔] Register — naya email/password se account banao
- [✔] Register — **same email dobara** try karo → proper error aana chahiye ("already exists"), crash nahi
- [✔] Register — **weak password** (8 se kam characters) try karo → validation error dikhna chahiye
- [✔] Login — sahi credentials se
- [✔] Login — **galat password** se → clear error message
- [✔] Login — **non-existent email** se → clear error message
- [✔] Logout — logout karo, phir refresh karo → logged out hi rehna chahiye
- [ ] Refresh — login karke browser tab band kiye bina 15+ min wait karo (ya access token expire hone do), phir koi action karo → automatically refresh hoke kaam karna chahiye
- [ ] Forgot Password — email daalo → email aana chahiye (App Password fix karne ke baad)
- [ ] Reset Password — email wale link se naya password set karo → naye password se login ho
- [✔] Google Login — sign in karo → account ban/login ho jaye
- [ ] Facebook Login — sign in karo → account ban/login ho jaye
- [✔] Google se pehli baar sign in karne wale email se agar already normal (email/password) account bana hai → dono link ho jaye ya clear error aaye, duplicate account na bane

### 2. Profile Management
- [✔] Name update karo → save ho aur reflect ho
- [✔] Phone update karo
- [✔] Change Password — sahi current password se
- [✔] Change Password — **galat current password** se → error aana chahiye

### 3. Address Management
- [ ]  Address backend me save nhi ho raha hai 
- [✔] Naya address add karo (sab fields fill karke)
- [✔] Address edit karo
- [✔] Address delete karo
- [✔] Ek se **zyada address add karke** "Set Default" try karo → sirf ek hi default rehna chahiye
- [✔] Required field **khali chhod ke** submit karo → validation error aana chahiye

### 4. Cart
- [✔] Item add karo cart me
- [✔] Quantity increase/decrease karo
- [✔] Item remove karo
- [✔] Poora cart clear karo
- [✔] **Same item, same karat/color/size, dobara add karo** → quantity update honi chahiye, duplicate entry nahi
- [✔] **Same product, alag karat** me do baar add karo (e.g. 9K aur 14K) → do alag cart entries banni chahiye
- [✔] Cart me price sahi karat ke hisaab se dikhe (product page wale se match kare)
- in proudct the purity is not showing 

### 5. Wishlist
- [ ] Item add karo wishlist me
- [ ] Item remove karo
- [ ] **Login kiye bina** wishlist use karne ki koshish karo → proper redirect/error aana chahiye

### 6. Banners
- [ ] Homepage pe active banners dikh rahe hai ya nahi (admin se add karne ke baad)

### 7. Announcements
- [ ] Homepage/top-bar pe active announcement dikh raha hai ya nahi

### 8. Product Catalog
- [ ] Catalog page load hote hi products dikhe (`product.json` se)
- [ ] Product card pe sahi image, title, category, "From ₹..." price dikhe
- [ ] Product detail page khulne pe sahi Title, Description, images dikhe
- [ ] Karat selector (9K/14K/18K) — switch karte hi price, making charge, GST, gross/net weight sab live update ho
- [ ] Color option select karo (agar product me hai)
- [ ] Size option select karo (agar product me hai)
- [ ] Ek product jisme colors/size_options nahi hain — check karo dropdown crash na kare, bas na dikhe

### 9. Search, Filter & Sort
- [ ] Search box me product name type karo → matching results aaye
- [ ] Search me kuch aisa type karo jo exist na kare → "No products available" jaisa clean message aaye, crash nahi
- [ ] Category dropdown se filter karo → sirf us category ke products dikhe
- [ ] Sort: Price low-to-high → sahi order me aaye
- [ ] Sort: Price high-to-low → sahi order me aaye
- [ ] Sort: Newest → sahi order me aaye
- [ ] Sort: Best sellers → `Is_Best_Seller: true` wale products upar aaye
- [ ] Search + Category + Sort **ek saath** use karo → sab combine ho ke sahi result aaye

### 10. Gold Rate / Pricing Security
- [ ] Browser DevTools → Network tab khol ke product page load karo → koi gold-rate API key kahin bhi request/response me na dikhe
- [ ] `/gold-rates` internal endpoint hi call ho raha ho, third-party API URL frontend se direct call na ho

### 11. Coupon (Admin se ek test coupon banane ke baad)
- [ ] Valid coupon code apply karo → discount sahi calculate ho
- [ ] **Invalid/wrong code** try karo → clear error
- [ ] **Expired coupon** try karo (admin se past date wala banao) → error aana chahiye
- [ ] **Minimum cart value se kam** amount pe apply karo (agar min-value set hai) → error aana chahiye
- [ ] Coupon remove karo → total wapas normal ho jaye
- [ ] `scope: all` wala coupon — **har** product page pe dikhe + checkout pe apply ho
- [ ] `scope: category` wala coupon — sirf us category ke product page pe dikhe; checkout pe **sirf jab cart me us category ka item ho** tabhi apply ho
- [ ] Wahi category-coupon **cart me us category ka item na ho** tab apply try karo → clear rejection message aana chahiye (silently 0 discount nahi)
- [ ] `scope: product` wala coupon — sirf us specific product ke page pe dikhe; checkout pe sirf jab wahi product cart me ho
- [ ] Usage limit khatam ho chuka coupon apply karo → reject ho
- [ ] Ek coupon 2 baar consecutively use karo (agar usageLimit=1 hai) → doosri baar reject ho (usedCount sahi se badh raha hai check kar)
- [ ] **Checkout page pe jo discount dikh raha hai, wahi amount Razorpay me actually charge ho raha hai ya nahi — number-by-number match kar** (known bug tha, dobara verify zaroori)

### 12. Checkout Summary
- [ ] Cart total sahi aa raha hai (sab item price × quantity sum)
- [ ] Coupon discount sahi subtract ho raha hai total se
- [ ] ₹25,000 se **upar** ka cart → shipping ₹0 aana chahiye
- [ ] ₹25,000 se **neeche** ka cart → shipping fee lagni chahiye
- [ ] **Cart khali karke** checkout page pe jao → crash na ho, proper "empty cart" message aaye

### 13. Razorpay Payment
- [ ] Test mode me "Pay securely" click karo → Razorpay popup khule
- [ ] Test card se **successful** payment karo → order `confirmed` ho, OrderConfirmation page pe redirect ho
- [ ] Payment **fail** karo (Razorpay test failure card se) → clear error dikhe, retry ka option mile
- [ ] Payment popup **beech me band** kar do (bina complete kiye) → order `pending` hi rahe, `failed` na ho jaye
- [ ] Failed/abandoned payment ke baad **dobara try karo** → naya duplicate pending order na bane, wahi purana reuse ho
- [ ] Order verify **do baar** trigger karo (jaise page refresh) → dobara "confirmed" set na ho ya error na aaye (idempotency check)

### 14. Order Confirmation Page
- [ ] Payment success ke baad real order ID, real items (title, image, karat, quantity, price) dikhe — koi fake/hardcoded data nahi
- [ ] Total sahi dikhe (discount + shipping included hone ke baad ka final amount)
- [ ] "For order tracking, contact us at [number]" wala static note dikhe

### 15. Order History Page
- [ ] Login karke apne saare past orders dekho → list aaye
- [ ] Har order ka status (`confirmed`/`failed`/`pending`) sahi dikhe
- [ ] Order pe click karke detail dekho → same data jo confirmation page pe tha
- [ ] Doosre account se login karo → sirf **apne** orders dikhe, doosron ke nahi
- [ ] **Security check:** ek order ka confirmation/detail URL directly copy karke doosre logged-in customer se kholne ki koshish karo → block/404 hona chahiye, doosre ka order data leak nahi hona chahiye
- [ ] Koi cancel/return button na dikhe (yeh scope me nahi hai, confirm kar accidentally add nahi hua)

### 16. Reviews
- [ ] Product page pe review submit karo (rating + text) → "submitted for moderation" jaisa message aaye
- [ ] Submit karte hi wo turant product page pe **public** na dikhe (moderation pending state)
- [ ] Same product pe **dobara** review submit karne ki koshish karo → reject ho ("already reviewed")
- [ ] Rating without login try karo → login required error aaye
- [ ] Admin panel se review **approve** karo → ab wo product page pe dikhe
- [ ] Admin panel se review **reject/delete** karo → wo kahin na dikhe
- [ ] Multiple reviews ek product pe (alag users se) → sab dikhen, average rating sahi calculate ho (agar dikhaya ja raha hai)

---

## PHASE 2 — Admin Panel testing

### 1. Admin Auth
- [ ] Admin login (jo `.env` me `ADMIN_EMAIL/PASSWORD` set kiya)
- [ ] Admin logout
- [ ] Galat admin password → error aana chahiye
- [ ] **Normal customer account se `/admin` access karne ki koshish karo** → block hona chahiye (security check, zaroori hai)
- [ ] **`.env` me `ADMIN_PASSWORD` change karo, server restart karo** → **naye** password se login ho jaana chahiye, purana wala fail ho (seed-sync bug fix verify)

### 2. Banner Management
- [ ] Sirf **3 fixed slots** dikhein, har ek me sirf upload button + order — koi "Image URL" text field na ho
- [ ] Teeno slot fill karke homepage pe sahi order me dikhein
- [ ] Banner edit karo
- [ ] Banner delete karo
- [ ] Activate/Deactivate toggle karo → homepage pe reflect ho

### 3. Announcement Management
- [ ] Naya announcement create karo
- [ ] Edit/Delete
- [ ] Activate/Deactivate → homepage pe **turant** reflect ho (off karte hi gayab ho jaye)

### 4. Coupon Management
- [ ] Naya coupon create karo (Percentage type)
- [ ] Naya coupon create karo (Fixed amount type)
- [ ] "Applies to: All / Category / Specific Product" dropdown dikhe
- [ ] "Category" select karne pe category-picker aaye (dynamic list se, `product.json` ki categories)
- [ ] "Product" select karne pe product-picker aaye (dynamic list se, search karke dhoondh sake)
- [ ] Bana hua scoped coupon list me sahi scope ke saath dikhe
- [ ] Edit coupon
- [ ] Delete coupon
- [ ] Expiry date wala coupon banao (Phase 1 ke coupon test me use hoga)

### 5. User Management
- [ ] "Users" tab confirm kar sidebar me hai ya nahi
- [ ] (Agar hai) User list dikhe
- [ ] Block/Unblock kisi test user ko → us user ka login block ho jaye

### 6. Reviews Moderation
- [ ] Pending reviews ki list dikhe
- [ ] Approve/Reject/Delete teeno buttons kaam karein

### 7. Order Overview (agar admin side banaya hai)
- [ ] Admin sabhi orders dekh sake (sabke, customer-wise nahi)
- [ ] Payment status aur order status sahi dikhein

### 8. General Admin UI/UX sanity
- [ ] Har form field ka label clearly samajh aaye — koi truncated text jaise "Choose File N...n" na ho
- [ ] Buttons ka visual hierarchy clear ho — Save vs Delete ka color/weight alag dikhe
- [ ] Koi bhi form submit karte waqt clear success/error feedback mile (kuch na kuch dikhna chahiye)

---

## Not yet in scope — build hone ke baad alag checklist banegi
- WhatsApp cart-reminder


Cart 
customer review UI, Edit or delete it 
no approval 
admin should able to login user panel and admin panel at same time 
whatsapp reminders 
Admin UI + no product are showign in frontend ?