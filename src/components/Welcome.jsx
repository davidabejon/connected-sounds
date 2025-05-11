import { Button, Modal, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import '../styles/Welcome.css';
import Title from 'antd/es/typography/Title';
import video_example from '../assets/video_example.mp4';
import david from '../assets/david.jpg';
import marker from '../assets/map/radio-icon-notselected.png';
import { GithubOutlined, LinkedinOutlined, LinkOutlined, XOutlined } from '@ant-design/icons';
const { Text, Link } = Typography;

function Welcome({ isModalOpen, setIsModalOpen }) {

  const dontShowAgain = () => {
    setIsModalOpen(false);
    localStorage.setItem('dontShowWelcome', true);
  }

  useEffect(() => {
    if (localStorage.getItem('dontShowWelcome')) {
      setIsModalOpen(false);
    }
    else {
      setIsModalOpen(true);
    }
  }, [])

  const items = [
    {
      key: '1',
      label: 'What is this?',
      children:
        // half of the height of the screen
        <div>
          <Title level={2} className='text-center fw-bold'>This is <span className='title-gradient'>Connected Sounds</span>!</Title>
          <p className='subtitle'>
            Connected Sounds is a web application that allows you to listen to radio stations from around the world.<br></br>
            Explore the map, click anywhere and start listening, it's that simple!
          </p>
          <div className='d-flex justify-content-around mt-4 flex-wrap'>
            <video id='welcome-video' autoPlay muted loop>
              <source src={video_example} type='video/mp4' />
            </video>
            <div className='d-flex flex-column justify-content-between mt-3 align-items-center'>
              <div className='d-flex flex-column flex-wrap'>
                <Title level={4} className='fw-bold'>Getting started:</Title>
                <ul>
                  <li>Click on the markers <img className='mb-1' src={marker} width={24} /> to start listening</li>
                  <li>Click right or left to change the radio station</li>
                  <li>Adjust the volume using the slider</li>
                  <li>Click on the mute button to mute the radio</li>
                </ul>
                <div className='d-flex gap-2 justify-content-center mt-1'>
                  <Button key="submit" type="primary" onClick={() => setIsModalOpen(false)}>
                    Got it!
                  </Button>
                  <Button key="back" onClick={dontShowAgain}>
                    Do not show this again
                  </Button>
                </div>
              </div>
              <Text>⚡ Powered by <Link href='https://www.radio.garden/' target='_blank'>Radio Garden</Link></Text>
            </div>
          </div>
        </div>
      ,
    },
    {
      key: '2',
      label: 'About me',
      children:
        <div>
          <Title level={2} className='text-center fw-bold'>You really wanna know <span className='about-me-gradient'>about me</span>?!</Title>
          <p className='subtitle'>
            Hi! My name is <span className='fw-bold'>David</span>, I'm an informatics engineer and I love web developing<br></br>
            I created this project as a way to explore new technologies and to share my love for music with the world.
          </p>
          <div className='d-flex justify-content-around mt-4 flex-wrap gap-2'>
            <div className='d-flex flex-column justify-content-evenly'>
              <Title level={4} className='fw-bold m-0 text-center'>Check out my socials below!</Title>
              <div className='d-flex justify-content-around'>
                <a href='https://github.com/davidabejon' title='GitHub' target='_blank'>
                  <GithubOutlined style={{ fontSize: '4em' }} />
                </a>
                <a href='https://www.linkedin.com/in/davidabejonheras/' title='Linkedin' target='_blank'>
                  <LinkedinOutlined style={{ fontSize: '4em' }} />
                </a>
                <a href='https://davidabejon.cv/?language=en' title='Portfolio' target='_blank'>
                  <LinkOutlined style={{ fontSize: '4em' }} />
                </a>
              </div>
              <p className='subtitle'>Send me an email at <Link href='mailto:davidabejonheras@gmail.com'>davidabejonheras@gmail.com</Link></p>
            </div>
            <img className='my-photo' src={david} alt='Photo of myself!' width={250} height={250} />
          </div>
        </div>,
    },
    {
      key: '3',
      label: 'Legal Notice',
      children:
        <div>
          <Title level={5}>Data Source</Title>
          <Text type="secondary">
            The information and location data for radio stations featured on this website are collected using the Radio Garden API. All copyrights and trademarks related to the radio station data belong to their respective owners.
          </Text>
          <Title level={5}>Disclaimer</Title>
          <Text type="secondary">
            This website is an independent platform and is not affiliated with, endorsed by, or officially connected to Radio Garden. The use of the Radio Garden API is for informational purposes only, and we strive to ensure the accuracy of the data. However, we do not guarantee the completeness or reliability of the information provided.
          </Text>
          <Title level={5}>Copyright and Intellectual Property</Title>
          <Text type="secondary">
            All content, including logos, radio streams, and metadata, are the intellectual property of their respective owners. If you are a copyright holder and believe that your rights are being infringed upon, please contact us at <a href="mailto:davidabejonheras@gmail.com">davidabejonheras@gmail.com</a> so we can address your concerns.
          </Text>
          <Title level={5}>Terms of Use</Title>
          <Text type="secondary">
            By using this website, you agree to use it for personal and non-commercial purposes only. Any unauthorized commercial use of the content or data from this website is strictly prohibited.
          </Text>
        </div>,
    }
  ];

  return (
    <Modal
      title={<Tabs defaultActiveKey='1' items={items} />}
      open={isModalOpen}
      onCancel={() => setIsModalOpen(false)}
      width={800}
      height={600}
      footer={
        <></>}
    >
    </Modal>
  );
}

export default Welcome;