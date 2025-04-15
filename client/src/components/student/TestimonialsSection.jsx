import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    <div className='pb-14 px-8 md:px-0'>
      <h2 className='text-3xl font-medium text-gray-800'>Testimonials</h2>
      <p className='md:text-base text-gray-500 mt-3'>Here from our learners as they share the journeys of transformation, success and how our <br /> platform has made a differnet in their lives...</p>
      <div className='grid grid-cols-auto gap-8 mt-14'>
        {dummyTestimonial.map((testnimonial,index)=>(
          <div key={index} className='text-sm text-left border bg-gray-300/30 pb-6 rounded-lg bg-white shadow-[0px_4px_15px_0px] overflow-hidden shadow-black/5'>
            <div className='flex items-center gap-4 px-5 py-4 bg-gray-500/10 '>
              <img className='h-12 w-12 rounded-full' src={testnimonial.image} alt={testnimonial.name} />
              <div>
                <h1 className='text-lgfont-medium text-gray-800'>{testnimonial.name}</h1>
                <p className='text-gray-800/80'>{testnimonial.role}</p>
              </div>
              
            </div>
            <div className='p-5 pb-7'>
                <div className='flex gap-0.5'>{[...Array(5)].map((_,i)=>(
                  <img className='h-5' key={i} src={i<Math.floor(testnimonial.rating) ? assets.star :  assets.star_blank} alt='star' />
                ))}</div>
              <p className='test-gray-500 mt-5'>{testnimonial.feedback}</p>
              </div>
              <a href="#" className='text-blue-500 underline px-5'>Read more</a>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default TestimonialsSection