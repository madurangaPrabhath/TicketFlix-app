import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <div>
        {text1} <span className='text-red-600'>{text2}</span>
    </div>
  )
}

export default Title