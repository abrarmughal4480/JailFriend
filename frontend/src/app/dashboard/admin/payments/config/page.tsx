"use client";

import { useState } from 'react';

interface PaymentMethod {
  enabled: boolean;
  [key: string]: any;
}

export default function PaymentConfiguration() {
  // Withdrawal Settings
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    bankTransfer: false,
    paypal: true,
    skrill: false,
    customMethod: false,
    minimumWithdrawal: 50
  });

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<{[key: string]: PaymentMethod}>({
    coinPayments: {
    enabled: false,
    secretKey: '',
    publicKey: ''
    },
    localBank: {
      enabled: false,
      description: '',
      transferNote: ''
    },
    paypal: {
    enabled: false,
      showTransactionLogs: true,
      mode: 'sandbox',
    clientId: '',
    secretKey: '',
    currency: 'USD'
    },
    stripe: {
    enabled: false,
      aliPay: false,
    currency: 'USD',
      apiSecretKey: '',
      publishableKey: ''
    },
    paystack: {
    enabled: false,
    secretKey: ''
    },
    razorpay: {
      enabled: true,
      applicationId: 'rzp_test_I4IbIo4vSMbAbB',
      applicationSecret: '10oG19MmNZGFpP7Bsu9UTBZX'
    },
    paysera: {
      enabled: false,
      mode: 'sandbox',
      projectId: '',
      password: ''
    },
    yoomoney: {
      enabled: false,
      walletId: '',
      notificationSecret: ''
    },
    securionpay: {
      enabled: false,
      publicKey: '',
      secretKey: ''
    },
    coinbase: {
      enabled: false,
      apiKey: ''
    },
    iyzipay: {
      enabled: false,
      mode: 'sandbox',
      key: '',
      secretKey: '',
      buyerId: '',
      buyerName: '',
      buyerSurname: '',
      buyerGsmNumber: '',
      buyerEmail: '',
      buyerIdentityNumber: '',
      buyerAddress: '',
      buyerCity: '',
      buyerCountry: '',
      buyerZip: ''
    },
    cashfree: {
      enabled: false,
      mode: 'live',
      clientId: '',
      clientSecret: ''
    },
    twoCheckout: {
      enabled: false,
      mode: 'sandbox',
      currency: 'USD',
      sellerId: '',
      publishableKey: '',
      privateKey: ''
    },
    authorizeNet: {
      enabled: false,
      testMode: 'test',
      apiLoginId: '',
      transactionKey: ''
    },
    flutterWave: {
      enabled: false,
      apiSecretKey: '',
      publicKey: '',
      encryptionKey: ''
    },
    ngenius: {
      enabled: false,
      testMode: 'test',
      apiKey: '',
      outletId: ''
    },
    braintree: {
      enabled: false,
      testMode: 'test',
      merchantId: '',
      publicKey: '',
      privateKey: ''
    },
    fortumo: {
      enabled: false,
      serviceId: ''
    },
    aamarpay: {
      enabled: false,
      testMode: 'test',
      storeId: '',
      signatureKey: ''
    },
    qiwi: {
      enabled: false,
      testMode: 'test',
      merchantId: '',
      publicKey: '',
      privateKey: ''
    },
    payfast: {
      enabled: false,
      testMode: 'test',
      merchantId: '',
      merchantKey: ''
    }
  });

  const toggleWithdrawalMethod = (method: keyof typeof withdrawalSettings) => {
    setWithdrawalSettings(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        enabled: !prev[method].enabled
      }
    }));
  };

  const updatePaymentMethod = (method: string, field: string, value: any) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean, onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        enabled 
          ? 'bg-green-500 focus:ring-green-500' 
          : 'bg-red-500 focus:ring-red-500'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {enabled && (
        <svg className="absolute right-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      )}
      {!enabled && (
        <svg className="absolute left-1 w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L8 5.414V17a1 1 0 102 0V5.414l6.293 6.293a1 1 0 001.414-1.414l-9-9z"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-orange-500 hover:text-orange-700">
                    Home
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <a href="#" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Settings
                  </a>
          </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span className="ml-2 text-sm font-medium text-red-500">
                    Payment Configuration
                  </span>
        </div>
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Payment Configuration
          </h1>

        {/* Alert Messages */}
          <div className="mb-6 space-y-4">
            <div className="bg-green-100 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Looking to manage currencies? <a href="#" className="underline">Click Here.</a>
              </p>
            </div>
          </div>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                Please note that only the supported currencies from the payment provider are showing for each payment method.
              </p>
                </div>
            </div>
          </div>
        </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Withdrawal Settings */}
            <div className="space-y-8">
            {/* Withdrawal Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Withdrawal Settings
                </h2>

                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <p className="text-sm text-blue-700">
                    Users can send withdrawal requests via any of these methods
                  </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-gray-900">Bank Transfer</span>
                    <ToggleSwitch 
                      enabled={withdrawalSettings.bankTransfer}
                      onToggle={() => toggleWithdrawalMethod('bankTransfer')}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-900">Paypal</span>
                    <ToggleSwitch 
                      enabled={withdrawalSettings.paypal}
                      onToggle={() => toggleWithdrawalMethod('paypal')}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-900">Skrill</span>
                    <ToggleSwitch 
                      enabled={withdrawalSettings.skrill}
                      onToggle={() => toggleWithdrawalMethod('skrill')}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-900">Custom Method</span>
                    <ToggleSwitch 
                      enabled={withdrawalSettings.customMethod}
                      onToggle={() => toggleWithdrawalMethod('customMethod')}
                    />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum withdrawal request
                </label>
                <input
                  type="number"
                    value={withdrawalSettings.minimumWithdrawal}
                    onChange={(e) => setWithdrawalSettings(prev => ({
                      ...prev,
                      minimumWithdrawal: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum withdrawal the users can request
                  </p>
              </div>
            </div>

              {/* CoinPayments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure CoinPayments Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.coinPayments.enabled}
                    onToggle={() => togglePaymentMethod('coinPayments')}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  CoinPayments Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Get paid by bitcoin, simple and easy.
                </p>
              
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key
                    </label>
                  <input
                    type="text"
                      value={paymentMethods.coinPayments.secretKey}
                      onChange={(e) => updatePaymentMethod('coinPayments', 'secretKey', e.target.value)}
                      placeholder="Your CoinPayments Secret Key."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Public Key
                    </label>
                  <input
                    type="text"
                      value={paymentMethods.coinPayments.publicKey}
                      onChange={(e) => updatePaymentMethod('coinPayments', 'publicKey', e.target.value)}
                      placeholder="Your CoinPayments Public Key."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Get Supported Coins
                  </button>
                </div>
              </div>

              {/* Local Bank */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure Local Bank Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.localBank.enabled}
                    onToggle={() => togglePaymentMethod('localBank')}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Bank Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Get paid by bank transfers.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Description Code
                    </label>
                    <textarea
                      rows={8}
                      value={paymentMethods.localBank.description}
                      onChange={(e) => updatePaymentMethod('localBank', 'description', e.target.value)}
                      placeholder="Set your IBAN, SWIFT code from the code above."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Transfer Note
                    </label>
                    <textarea
                      rows={4}
                      value={paymentMethods.localBank.transferNote}
                      onChange={(e) => updatePaymentMethod('localBank', 'transferNote', e.target.value)}
                      placeholder="In order to confirm the bank transfer, you will need to upload a receipt or take a screenshot of your transfer within 1 day from your payment date. If a bank transfer is made but no receipt is uploaded within this period, your order will be cancelled. We will verify and confirm your receipt within 3 working days from the date you upload it.

Your note to the customer after he submits the payment."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </div>
              </div>
            </div>
          </div>

            {/* Right Column - Payment Methods */}
            <div className="space-y-8">
              {/* PayPal */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure PayPal Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.paypal.enabled}
                    onToggle={() => togglePaymentMethod('paypal')}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  PayPal Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Enable PayPal to receive payments from ads and pro packages.
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900">Show Transaction Logs (All Payment Methods)</span>
                  <ToggleSwitch 
                    enabled={paymentMethods.paypal.showTransactionLogs}
                    onToggle={() => updatePaymentMethod('paypal', 'showTransactionLogs', !paymentMethods.paypal.showTransactionLogs)}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Show transaction history on user settings page.
                </p>

              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Mode
                    </label>
                    <select
                      value={paymentMethods.paypal.mode}
                      onChange={(e) => updatePaymentMethod('paypal', 'mode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="sandbox">Sandbox</option>
                      <option value="live">Live</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-1">
                      Choose the mode your application is using, for testing use the SandBox mode.
                    </p>
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Client ID
                    </label>
                    <input
                      type="text"
                      value={paymentMethods.paypal.clientId}
                      onChange={(e) => updatePaymentMethod('paypal', 'clientId', e.target.value)}
                      placeholder="Set your PayPal application ID."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Secret Key
                    </label>
                    <input
                      type="text"
                      value={paymentMethods.paypal.secretKey}
                      onChange={(e) => updatePaymentMethod('paypal', 'secretKey', e.target.value)}
                      placeholder="Set your PayPal application secret key."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Currency
                    </label>
                    <select
                      value={paymentMethods.paypal.currency}
                      onChange={(e) => updatePaymentMethod('paypal', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-1">
                      Set your PayPal currency, this will be used only on PayPal.
                    </p>
                </div>
              </div>
            </div>

              {/* Stripe */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure Stripe (Credit Cards) Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.stripe.enabled}
                    onToggle={() => togglePaymentMethod('stripe')}
                  />
              </div>
                <p className="text-sm text-gray-600 mb-4">
                  Stripe Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Enable Stripe to receive payments by credit cards.
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900">Alipay Payment Method</span>
                  <ToggleSwitch 
                    enabled={paymentMethods.stripe.aliPay}
                    onToggle={() => updatePaymentMethod('stripe', 'aliPay', !paymentMethods.stripe.aliPay)}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Allow AliPay payments by Stripe.
                </p>

                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Currency
                    </label>
                  <select
                      value={paymentMethods.stripe.currency}
                      onChange={(e) => updatePaymentMethod('stripe', 'currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                    <p className="text-sm text-gray-600 mt-1">
                      Set your Stripe currency, this will be used only on Stripe.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe API Secret Key
                    </label>
                    <input
                      type="text"
                      value={paymentMethods.stripe.apiSecretKey}
                      onChange={(e) => updatePaymentMethod('stripe', 'apiSecretKey', e.target.value)}
                      placeholder="Your Stripe secret key that starts with sk_"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stripe Publishable Key
                    </label>
                  <input
                    type="text"
                      value={paymentMethods.stripe.publishableKey}
                      onChange={(e) => updatePaymentMethod('stripe', 'publishableKey', e.target.value)}
                      placeholder="Your Stripe publishable key that starts with pk_"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

              {/* PayStack */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure PayStack (Credit Cards) Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.paystack.enabled}
                    onToggle={() => togglePaymentMethod('paystack')}
                  />
              </div>
                <p className="text-sm text-gray-600 mb-4">
                  Paystack Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Get paid by Paystack payment provider.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <input
                    type="text"
                    value={paymentMethods.paystack.secretKey}
                    onChange={(e) => updatePaymentMethod('paystack', 'secretKey', e.target.value)}
                    placeholder="Your paystack account secret key."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
            </div>

              {/* RazorPay */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Configure RazorPay (Credit Cards) Payment Method
                  </h3>
                  <ToggleSwitch 
                    enabled={paymentMethods.razorpay.enabled}
                    onToggle={() => togglePaymentMethod('razorpay')}
                  />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  RazorPay Payment Method
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Get paid by RazorPay payment provider.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application ID
                    </label>
                    <input
                      type="text"
                      value={paymentMethods.razorpay.applicationId}
                      onChange={(e) => updatePaymentMethod('razorpay', 'applicationId', e.target.value)}
                      placeholder="Your application client ID."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Secret
                    </label>
                    <input
                      type="text"
                      value={paymentMethods.razorpay.applicationSecret}
                      onChange={(e) => updatePaymentMethod('razorpay', 'applicationSecret', e.target.value)}
                      placeholder="Your application secret key."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
          <div className="mt-8 flex justify-end">
          <button
              onClick={() => alert('Payment configuration saved successfully!')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
