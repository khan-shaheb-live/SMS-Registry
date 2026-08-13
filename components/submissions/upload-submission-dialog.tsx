'use client'

import { useState } from 'react'
import { submitAssessmentAction } from '@/app/student/submissions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, UploadCloud, File, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getLateDescription } from '@/lib/business/submissions'

interface UploadSubmissionDialogProps {
  assessmentId: string
  assessmentTitle: string
  deadline: Date
  isLate: boolean
}

export function UploadSubmissionDialog({
  assessmentId,
  assessmentTitle,
  deadline,
  isLate,
}: UploadSubmissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    } else {
      setFile(null)
    }
  }

  const hasFile = file !== null
  const hasText = textContent.trim().length > 0

  async function handleFormSubmit(formData: FormData) {
    if (!hasFile && !hasText) {
      setError('Please provide text content or select a file to upload.')
      return
    }
    
    // Add text content to formData since it might not be in the form if it's a controlled component
    formData.set('textContent', textContent)
    
    // Show confirmation dialog first (academic integrity pledge)
    setPendingFormData(formData)
    setConfirmOpen(true)
  }

  async function handleConfirm() {
    if (!pendingFormData) return
    setIsLoading(true)
    setError(null)

    pendingFormData.set('assessmentId', assessmentId)
    
    const result = await submitAssessmentAction(pendingFormData)
    setIsLoading(false)
    setConfirmOpen(false)

    if (result?.error) {
      setError(result.error)
      return
    }

    toast.success('Assessment submitted successfully')
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            className={`gap-2 w-full h-10 rounded-xl ${
              isLate 
                ? 'bg-white border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 shadow-sm' 
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
            }`}
            variant={isLate ? 'outline' : 'default'}
          >
            <UploadCloud className="w-4 h-4" />
            {isLate ? 'Submit Late' : 'Submit Assessment'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Submission</DialogTitle>
          </DialogHeader>
          <form action={handleFormSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-slate-900">{assessmentTitle}</p>
              {isLate ? (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getLateDescription(new Date(), deadline)}
                </p>
              ) : (
                <p className="text-xs text-emerald-600">On time</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="textContent">Text Submission (Optional)</Label>
                <Textarea 
                  id="textContent"
                  placeholder="Type your submission text here..."
                  className="min-h-[120px]"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="file">Select File Attachment (Optional)</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.tar.gz"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="file" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                    {file ? (
                      <>
                        <File className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-slate-900 text-center max-w-full truncate px-4">{file.name}</span>
                        <span className="text-xs text-slate-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-slate-600 mb-2" />
                        <span className="text-sm font-medium text-blue-600">Click to browse</span>
                        <span className="text-xs text-slate-600 mt-1">Max file size: 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading || (!hasFile && !hasText)} className="gap-2 w-full">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog (Academic Honesty) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Academic Integrity Pledge</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>By submitting this work, you confirm that:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>This submission is entirely your own original work.</li>
                <li>All sources have been properly cited and referenced.</li>
                <li>You have not engaged in plagiarism or academic misconduct.</li>
              </ul>
              <p className="font-medium text-slate-900 mt-2">
                This action is final. You cannot update your submission after this point.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              I Agree, Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

