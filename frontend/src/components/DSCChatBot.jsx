import {useState, useRef} from 'react'
import axios from 'axios'
import {
  Container, TextField, Button, Typography, Box, Paper,
  Alert, CircularProgress, Card, CardContent, Divider, Chip, LinearProgress, Grid
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import SendIcon from '@mui/icons-material/Send'
import DeleteIcon from '@mui/icons-material/Delete'

function DSCChatBot(){
  const [file,setFile]=useState(null)
  const [uploading,setUploading]=useState(false)
  const [question,setQuestion]=useState('')
  const [answer,setAnswer]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [success,setSuccess]=useState('')
  const [questionHistory,setQuestionHistory]=useState([])
  const fileInputRef=useRef(null)

  const user=JSON.parse(localStorage.getItem('userInfo'))
  const userId=user?.email

  const handleFileChange=(e)=>{
    setFile(e.target.files[0])
    setError('')
    setSuccess('')
  }

  const removeFile=()=>{
    setFile(null)
    if(fileInputRef.current) fileInputRef.current.value=null
  }

  const uploadPdf=async()=>{
    if(!file){
      setError('Please select a PDF file.')
      return
    }

    const formData=new FormData()
    formData.append('file',file)
    formData.append('user_id',userId)

    setUploading(true)
    setError('')
    setSuccess('')

    try{
      await axios.post('https://aitutor-v49z.onrender.com/train',formData)
      setSuccess('PDF uploaded and trained!')
      setFile(null)
      if(fileInputRef.current) fileInputRef.current.value=null
    }catch(err){
      setError('Upload failed. Try again.')
      console.error(err)
    }finally{
      setUploading(false)
    }
  }

  const askQuestion=async()=>{
    if(!question.trim()){
      setError('Enter a question.')
      return
    }

    setLoading(true)
    setError('')
    try{
      const res=await axios.post('https://aitutor-v49z.onrender.com/query',{
        question,
        user_id:userId
      })
      const newAnswer=res.data.answer
      setAnswer(newAnswer)
      setQuestionHistory(prev=>[
        {question:question.trim(),answer:newAnswer,timestamp:new Date()},
        ...prev.slice(0,4)
      ])
      setQuestion('')
    }catch(err){
      setError('Query failed. Try again.')
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  const handleKeyPress=(e)=>{
    if(e.key==='Enter' && !e.shiftKey){
      e.preventDefault()
      askQuestion()
    }
  }

  const formatTimestamp=(timestamp)=>{
    return timestamp.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
  }

  const formatFileSize=(bytes)=>{
    if(bytes===0) return '0 Bytes'
    const k=1024
    const sizes=['Bytes','KB','MB','GB']
    const i=Math.floor(Math.log(bytes)/Math.log(k))
    return parseFloat((bytes/Math.pow(k,i)).toFixed(2))+' '+sizes[i]
  }

  return(
    <Container maxWidth="lg" sx={{mt:5}}>
      <Typography variant="h4" align="center" gutterBottom color="primary.dark">
        DSC ChatBot Assistant
      </Typography>

      {error && <Alert severity="error" sx={{my:2}}>{error}</Alert>}
      {success && <Alert severity="success" sx={{my:2}}>{success}</Alert>}

      <Grid container spacing={4}>
        {/* Upload Section */}
        <Grid item xs={12} md={5}>
          <Paper elevation={4} sx={{p:3,borderRadius:3}}>
            <Typography variant="h6" gutterBottom>📚 Upload PDF</Typography>

            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              id="upload-file"
              style={{display:'none'}}
            />
            <label htmlFor="upload-file">
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadFileIcon />}
                component="span"
                disabled={uploading}
              >
                Choose File
              </Button>
            </label>

            {file && (
              <Card sx={{my:2,backgroundColor:'#f5f5f5'}}>
                <CardContent sx={{display:'flex',justifyContent:'space-between'}}>
                  <Box>
                    <Typography variant="body1">{file.name}</Typography>
                    <Typography variant="caption">{formatFileSize(file.size)}</Typography>
                  </Box>
                  <Button color="error" size="small" onClick={removeFile}>
                    <DeleteIcon />
                  </Button>
                </CardContent>
              </Card>
            )}

            {uploading && <LinearProgress sx={{my:2}} />}

            <Button
              variant="contained"
              fullWidth
              onClick={uploadPdf}
              disabled={!file || uploading}
              sx={{mt:1}}
            >
              {uploading ? 'Training...' : 'Upload & Train'}
            </Button>
          </Paper>
        </Grid>

        {/* Chat Section */}
        <Grid item xs={12} md={7}>
          <Paper elevation={4} sx={{p:3,borderRadius:3}}>
            <Typography variant="h6" gutterBottom>💬 Ask a Question</Typography>

            <Box sx={{display:'flex',gap:2}}>
              <TextField
                fullWidth
                label="Type your question"
                value={question}
                onChange={(e)=>setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                rows={3}
              />
              <Button
                variant="contained"
                onClick={askQuestion}
                disabled={loading || !question.trim()}
                startIcon={loading ? <CircularProgress size={20}/> : <SendIcon />}
                sx={{height:'fit-content',mt:1}}
              >
                Ask
              </Button>
            </Box>

            {answer && (
              <Paper elevation={1} sx={{p:2,mt:3,background:'#f0faff'}}>
                <Typography variant="subtitle1" color="primary">🤖 Answer:</Typography>
                <Typography sx={{mt:1,lineHeight:1.6}}>{answer}</Typography>
              </Paper>
            )}

            {questionHistory.length>0 && (
              <Box sx={{mt:3}}>
                <Divider><Chip label="Chat History" size="small" /></Divider>
                {questionHistory.map((item,index)=>(
                  <Box key={index} sx={{my:2,p:2,bgcolor:'#fafafa',borderRadius:2}}>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(item.timestamp)}
                    </Typography>
                    <Typography variant="body2" sx={{mt:1}}><strong>You:</strong> {item.question}</Typography>
                    <Typography variant="body2"><strong>Bot:</strong> {item.answer}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DSCChatBot
