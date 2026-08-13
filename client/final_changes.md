✔ **Navbar -**
1. the silver should be in kg (multiple by 1000)
2. and below the gold and silver write their weight - for gold it will be per 10gram and in silver per kg

**Home Page -**
1. add a point why choose - point Highest Clarity & Cut, VVS-EF Ideal cut diamonds = https://onyadiamonds.com/ 
2. make the prime collection image correct and change its saree color 

✔ 1. add a pop up - text is yet to decided 
✔ 2. add categories section above best seller - https://onyadiamonds.com/ - with cover image - and make it dynamic 
✔ 3. add a banner - https://onyadiamonds.com/ - the women working on laptop - add that 
✔ 4. remove SGL certification an add that hallmark (Hallmark text - Experience trustworthy gold hallmarking services, delivering accurate testing and authentic jewellery certification.) 
✔ 5. change the map link to complex only and add address in text 
✔ 6. change 10+ to 25+ 

✔ **Catalog Page - **
1. in filters the category option Gold/Silver is visible in mobile 
2. make the filters option fixed in big screens

**Gold Product Page -**
1. make all the product bg to white - make them - irrespective of their original bg color - just on site it should show white bg 

✔ 1. remove duplicate total directly show gst and then total amt
✔ 2. video is not visible 
✔ 3. share and add to wishlist option in all products
✔ 4. add a line that this are estimated price... below the final price and also at the end of
price breakup
✔ 5. there will be a option in admin panel to select the certificates and that certificate will be visible in product page with it names and logo (logo path I will add myself - I will give the certificate list and make it dynamic - means in code I will change the array then it should reflect in admin panel)

✔ **Silver Product Page -**
1. video is not visible 
2. remove net weight from user panel 
3. remove duplicate total directly show gst and then total amt
4. remove the ring size option from all - only show in ring categories - silver also 
5. share and add to wishlist option in all products 
6. add a line that this are estimated price... below the final price and also at the end of price breakup 

✔ **Loading Page -**
put original TBA Logo

✔ **Floating buttons - **
add a call button (office number)

**Admin Panel**
1. the SKU will be automatically as per predefined format and if any product removed from in between then also the sku number will not change (TBA-GLD-NCK-001) - yet to be decided

✔ 1. there will be a option in admin panel to select the certificates and that certificate will be visible in product page with it names and logo (logo path I will add myself - I will give the certificate list and make it dynamic - means in code I will change the array then it should reflect in admin panel)
✔ 2. in admin metal rates admin will add 24kt gold rate as per 10gram but after it divide and converted into 14 & 18 it should as per 1 gm so after converting 24kt 10gm in to 14 & 18k 10gm divide it by 10 to make per gram and then do next calculations
✔ 3. add a button to download all the products in a clearn excel sheet (in a clean format)
✔ 4. in admin panel - add products in silver the text which as diamond clarity which was fixed for all - will now not be fixed it should be as per 
✔ 5. add all shapes in diamond category 

**Login Page -**
1. add the discount option add a banner - https://onyadiamonds.com/ and also write it


Product Page - 
total diamond count number - this be manually added by admin in add products - admin panel
 
1. B2B - product catalog - filter not working properly 
2. SKU - TBA-GLD-NL0001 - this will be the format 
✔ 3. change the category in shop by category from Shop by Gold.. to Shop by Diamond...
✔ 4. 925 Silver with Moissanite Diamond - bold it - Moissanite & Polki - ALl Silver Categories 
✔ 5. 925 Silver with Polki Diamond - bold it - Polki & Polki - ALl Silver Categories 
✔ 6. Lab grown diamond + brand name(tba + the brillaince atteiter) = in every product description 
7. make certificate charges manually, add a new input box of certifcate charges = manual entery of diamond weight - gold change 
✔ 8. show only price in silver categories - no component breakup
✔ 9. Correct description format 


1. Gross weight is not visible in products in b2c and b2b both 
2. if total number of diamonds are 0 then that line should not visible in product in b2c and b2b both 
3. the admin can enter Moissanite or Polki entries - but currently it will not visible in the product page and no error should be visible - currently on entering the entries the product page is not loading there is a error - check that 
4. prime collection product - add to cart, wishlist buttons not working and kt toggle needs to be fix and UI improvements - and the buttons are not working and the ui is also not good
5. new diamond category list 
6. certificate charge manually 
7. facebook testing Locate every place in the codebase (admin panel product list/detail views, B2B storefront, B2C storefront, cart, pricing calculation, order creation, any API response) where a product's b2bPrice or b2cPrice is currently read directly from the product document.

For any product whose category is a diamond category (has a diamondCategoryRef set), replace that direct read with a call to the diamondPricing.js helper created earlier, so the price shown/calculated is always either the live current DiamondCategory master data price, or the diamondPriceOverride if one is set on that product — following the exact same resolution logic already implemented in diamondPricing.js.

For all non-diamond products (gold, silver), do not change how their price is read at all — leave that logic 100% untouched.


1. Admin Panel - calculation 
2. Solve product update 
3. Filters in B2B - not working - the kt and also remove the option All & also for the prices not working & why filter is applying for both gold & silver 
4. fix dropdown in diamond entry in admin panel 
5. metal rates b2b & b2c 




13-08-26 = 
b2b filters not working