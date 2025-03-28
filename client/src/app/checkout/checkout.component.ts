import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  currentUser: any;
  currentStep = 1;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCode: string;
  cartData: any;
  products: any;
  loading = false;
  successMessage = '';
  orderId;
  billingAddress: { name: string; type: string; placeholder: string; value: string }[];

  constructor(private _auth: AuthService, private _cart: CartService) {
    
    this._cart.cartDataObs$.subscribe((cartData) => {
      this.cartData = cartData;
    });
    
  }

  ngOnInit(): void {

    this._auth.user.subscribe((user) => {
      if (user) {
      
     this.billingAddress = [
      
      {
        name: 'Full name',
        placeholder: 'Enter your full name',
        type: 'text',
        value: user.fname,
      },
      {
        name: 'Email',
        placeholder: 'Enter your email address',
        type: 'email',
        value: user.email,
      },
      {
        name: 'Address',
        placeholder: 'Enter your address',
        type: 'text',
        value: '',
      },
      {
        name: 'City',
        placeholder: 'Enter your city',
        type: 'text',
        value: '',
      },
      {
        name: 'Country',
        placeholder: 'Enter your country',
        type: 'text',
        value: '',
      },
      {
        name: 'Zip Code',
        placeholder: 'Enter your zip code',
        type: 'text',
        value: '',
      },
      {
        name: 'Telephone',
        placeholder: 'Enter your telephone number',
        type: 'text',
        value: '',
      },
    ];
    this.currentUser = user.id;
    //this.billingAddress[0].value = user.fname;
     
      }
    });
    
   
    // Puedes realizar otras inicializaciones aquí si es necesario
  }

  submitCheckout() {
    this.loading = true;
    setTimeout(() => {
      this._cart
        .submitCheckout(this.currentUser, this.cartData)
        .subscribe(
          (res: any) => {
            console.log(res);
            this.loading = false;
            this.orderId = res.orderId;
            this.products = res.products;
            this.currentStep = 4;
            this._cart.clearCart();
          },
          (err) => {
            console.log(err);
            this.loading = false;
          }
        );
    }, 750);
  }

  getProgressPrecent() {
    return (this.currentStep / 4) * 100;
  }

  submitBilling(): void {
    this.nextStep();
  }

  canBillingSubmit(): boolean {
    return this.billingAddress.filter((field) => field.value.length > 0)
      .length !== 7
      ? true
      : false;
       //}
      // return false;
  }

  submitPayment(): void {
    this.nextStep();
  }

  canPaymentSubmit(): boolean {
    return this.cardNumber && this.cardName && this.cardExpiry && this.cardCode
      ? true
      : false;
  }

  nextStep(): void {
    this.currentStep += 1;
    localStorage.setItem('checkoutStep', this.currentStep.toString());
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
      localStorage.setItem('checkoutStep', this.currentStep.toString());
    }
  }
}
