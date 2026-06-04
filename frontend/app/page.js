'use client'
import { useState } from 'react'

export default function Home() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const handleDetect = async () => {
    if (!image) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', image)

    try {
      const response = await fetch('http://127.0.0.1:8000/detect', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Detection failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-2">🦺 SafeLens</h1>
        <p className="text-center text-gray-400 mb-8">
          PPE Compliance Detector — upload an image to check for safety violations
        </p>

        {/* Upload Box */}
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <div className="text-gray-400 mb-3 text-lg">
              📁 Click to upload an image
            </div>
            <div className="text-gray-600 text-sm">JPG, PNG supported</div>
          </label>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Uploaded Image:</p>
            <img src={preview} alt="preview" className="rounded-xl w-full" />
          </div>
        )}

        {/* Detect Button */}
        {image && (
          <button
            onClick={handleDetect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-8 disabled:opacity-50"
          >
            {loading ? 'Detecting...' : 'Run PPE Detection'}
          </button>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Annotated Image */}
            <p className="text-gray-400 text-sm mb-2">Detection Result:</p>
            <img
              src={`data:image/jpeg;base64,${result.annotated_image}`}
              alt="annotated"
              className="rounded-xl w-full mb-6"
            />

            {/* Detections List */}
            <h2 className="text-xl font-semibold mb-3">Detections</h2>
            {result.detections.length === 0 ? (
              <p className="text-gray-400">No PPE items detected.</p>
            ) : (
              <div className="space-y-2">
                {result.detections.map((det, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                      det.label.startsWith('NO-')
                        ? 'bg-red-900 border border-red-600'
                        : 'bg-green-900 border border-green-600'
                    }`}
                  >
                    <span className="font-medium">{det.label}</span>
                    <span className="text-sm text-gray-300">
                      {Math.round(det.confidence * 100)}% confident
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}