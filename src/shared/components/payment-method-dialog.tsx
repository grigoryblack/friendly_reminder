'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export function PaymentMethodDialog() {
  const [open, setOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.slice(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setExpiryDate(formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3)
    setCvv(value)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement API call to save payment method
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      // Reset form
      setCardNumber('')
      setCardHolder('')
      setExpiryDate('')
      setCvv('')
      setOpen(false)
    } catch (error) {
      console.error('Error saving payment method:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = () => {
    return (
      cardNumber.replace(/\s/g, '').length === 16 &&
      cardHolder.trim().length > 0 &&
      expiryDate.length === 5 &&
      cvv.length === 3
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          <CreditCard className="w-4 h-4 mr-2" />
          Способы оплаты
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить способ оплаты</DialogTitle>
          <DialogDescription>
            Введите данные вашей банковской карты для оплаты курсов
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Card Preview */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4 sm:mb-8">
              <div className="w-10 h-6 sm:w-12 sm:h-8 bg-yellow-400 rounded"></div>
              <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="text-base sm:text-xl tracking-wider font-mono">
                {cardNumber || '•••• •••• •••• ••••'}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-70 mb-1">Владелец карты</div>
                  <div className="text-sm sm:text-base font-medium uppercase">
                    {cardHolder || 'ИМЯ ФАМИЛИЯ'}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">Срок действия</div>
                  <div className="text-sm sm:text-base font-medium">{expiryDate || 'MM/YY'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Номер карты</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              className="font-mono"
            />
          </div>

          {/* Card Holder */}
          <div className="space-y-2">
            <Label htmlFor="cardHolder">Имя владельца</Label>
            <Input
              id="cardHolder"
              placeholder="IVAN IVANOV"
              value={cardHolder}
              onChange={e => setCardHolder(e.target.value.toUpperCase())}
              maxLength={50}
            />
          </div>

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Срок действия</Label>
              <Input
                id="expiryDate"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                maxLength={5}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                maxLength={3}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid() || isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить карту'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
