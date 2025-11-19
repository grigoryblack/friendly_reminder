'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, BookOpen, Users, GraduationCap, Heart, CheckCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select } from '@/shared/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'PARENT' | 'TEACHER'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Account created successfully! You can now sign in.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return <GraduationCap className="w-5 h-5" />
      case 'PARENT':
        return <Heart className="w-5 h-5" />
      case 'TEACHER':
        return <Users className="w-5 h-5" />
      default:
        return <GraduationCap className="w-5 h-5" />
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'Access courses, manage your learning schedule'
      case 'PARENT':
        return 'Monitor your child\'s progress and activities'
      case 'TEACHER':
        return 'Create courses, manage students, track progress'
      default:
        return 'Choose your role to get started'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-primary">Friendly Reminder</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Join our learning community today
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Easy Registration</h3>
                  <p className="text-sm text-muted-foreground">Quick setup process with role-based access</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Community Driven</h3>
                  <p className="text-sm text-muted-foreground">Connect with teachers and students worldwide</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Rich Learning Experience</h3>
                  <p className="text-sm text-muted-foreground">Interactive courses and personalized schedules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="w-full max-w-md mx-auto space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center">
                  Choose your role and get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="PARENT">Parent</option>
                      <option value="TEACHER">Teacher</option>
                    </Select>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                      {getRoleIcon(formData.role)}
                      <span>{getRoleDescription(formData.role)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>

                  <div className="text-center">
                    <span className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 underline-offset-4 hover:underline font-medium"
                      >
                        Sign in
                      </Link>
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
