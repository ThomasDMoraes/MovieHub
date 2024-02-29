//React Bootstrap imports
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import linkedinIcon from '../icons/linkedin.png'
import githubIcon from '../icons/github.png'

/**
 * Contains some project info and links
 */
function Footer() {
    return (
        <Container className="bg-dark text-white footer" fluid>
            <Row variant="dark">
                <Col className="lg-3 ms-3">
                    <h3 className="text-center border-bottom py-2">About Us:</h3>
                    <p className="px-3">
                        MovieHub is a personal project that started as a course project, and is not currently meant for commercial use.
                        The utilized architecture is completely working within the free-tier, but the project could scale without major changes.
                        To the right are links to my social network. Change the OMDB API key if needed, as my free key is only allowed 1000 requests per day.
                    </p>
                </Col>
                <Col className="text-center">
                    <h3 className="border-bottom py-2">Social Network:</h3>
                    <ul className="list-unstyled py-2 px-3">
                        <li>
                            <a className="text-white footer-link" href="https://www.linkedin.com/in/thomas-moraes-84162025b">
                                <Image className="icon-bg-white mx-2" src={linkedinIcon} width="30" roundedCircle></Image>
                                https://www.linkedin.com/in/thomas-moraes-84162025b
                            </a>
                        </li>
                        <li>
                            <a className="text-white footer-link" href="https://github.com/ThomasDMoraes">
                                <Image className="icon-bg-white mx-2" src={githubIcon} width="30" roundedCircle></Image>
                                https://github.com/ThomasDMoraes 
                            </a>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Container>
    )
}

export default Footer;