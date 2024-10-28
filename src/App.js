import { FTClient } from "ft-client";
import {useEffect, useMemo, useRef, useState} from "react";
import styled from "@emotion/styled";
import logo from './assets/images/logo.svg'

const LEADERBOARD_ENDPOINT_URL = "https://games-admin.fut.ru/api/";
const LEADERBOARD_PROJECT_ID = "runner-vkusno-i-tochka";
const SPECIAL_GROUP_AMOUNT = 10;
const MIN_DESKTOP_WIDTH = 992

const ftClient = new FTClient(LEADERBOARD_ENDPOINT_URL, LEADERBOARD_PROJECT_ID);

const Wrapper = styled.div`
    position: relative;
    min-height: 100%;
    background: var(--color-green);
    --p_size: min(24px, 7.4vw);
    padding: var(--p_size) var(--p_size) calc(var(--p_size) / 2);

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        --p_size: min(50px, 3.75vw);
    }
`

const LogoWrapper = styled.div`
    display: flex;
    justify-content: center;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        justify-content: flex-start;
    }
`;

const Logo = styled.img`
    width: auto;
    height: 26px;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        height: 84px;
    }
`;

const Title = styled.h2`
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    color: white;
    white-space: pre-line;
    margin-top: 24px;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        font-size: 54px;
        margin-top: 0;
    }
`

const Content = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 36px;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        margin-top: 57px;
    }
`

const Groups = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 15px;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        margin-top: 26px;
    }
`

const Group = styled.div`
    border-radius: 16px;
    border: 1px solid white;
    overflow: hidden;
    
    & + & {
        margin-top: 13px;
    }

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        border: 4px solid white;
        border-radius: 32px;

        & + & {
            margin-top: 56px;
        }
    }
`

const List = styled.ul`
    list-style: none;
`

const Item = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 15px 13px 12px;
    color: white;
    
    & + & {
        border-top: 1px solid white;
    }

    & span {
        font-size: 16px;
        font-weight: 300;

        @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
            font-size: 24px;
        }
    }

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        padding: 20px 66px 22px;

        & + & {
            border-top: 4px solid white;
        }
    }
`

const LoaderWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`

const Loader = styled.svg`
    height: 80px;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        height: 160px;
    }
`

const InputContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`

const InputWrapper = styled.div`
    display: inline-flex;
    position: relative;
    width: ${({opened}) => opened ? '100%' : '40px'};
    height: 40px;
    padding: ${({opened}) => opened ? '10px 12px 10px 40px' : '10px 0 10px 40px'};
    background-color: var(--color-orange);
    border-radius: 20px;
    transition: width 200ms, padding 200ms;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        width: ${({opened}) => opened ? '100%' : '74px'};
        height: 74px;
        border-radius: 37px;

        padding: ${({opened}) => opened ? '17px 17px 17px 74px' : '17px 0 17px 74px'};
    }
`

const Input = styled.input`
    width: 100%;
    height: 100%;
    padding: 0;
    transform-origin: left;
    outline: none;
    border: none;
    font-size: 14px;
    font-weight: 300;
    background-color: inherit;
    color: #FFFFFF;
    
    &::placeholder {
        color: #FFFFFF;
        opacity: 0.8;
    }

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        font-size: 27px;
        line-height: 30px;
    }
`

const SearchIcon = styled.svg`
    position: absolute;
    width: 28px;
    height: 28px;
    top: 50%;
    left: 6px;
    transform: translateY(-50%);
    cursor: pointer;
    z-index: 1;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        width: 37px;
        height: 37px;
        left: 18px;
    }
`

const WarningText = styled.p`
    font-size: 20px;
    color: white;
    margin-top: 15px;
    width: 100%;
    text-align: center;

    @media (min-width: ${MIN_DESKTOP_WIDTH}px) {
        font-size: 40px;
        margin-top: 30px;
    }
`;

function SearchInput(props) {
    const {value, placeholder, onChange} = props
    const [opened, setOpened] = useState(false)
    const inputRef = useRef()

    function handleChange(e) {
        onChange?.(e.target.value)
    }

    function handleOpen() {
        setOpened(true)
        inputRef.current?.focus?.()
    }

    function handleClose() {
        setOpened(false)
    }

    const handleToggle = opened ? handleClose : handleOpen

    return (
        <InputContainer>
            <InputWrapper opened={opened}>
                <SearchIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleToggle}>
                    <circle cx="11" cy="11" r="7" stroke="#FFFFFF" strokeWidth="2.1"/>
                    <path d="M20 20L17 17" stroke="#FFFFFF" strokeWidth="2.1" strokeLinecap="round"/>
                </SearchIcon>
                <Input ref={inputRef} opened={opened} placeholder={placeholder} value={value} onChange={handleChange}/>
            </InputWrapper>
        </InputContainer>
    )
}

export function App() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [search, setSearch] = useState('')

    const groups = useMemo(() => {
        const sorted = [...(leaderboard)].filter(({id}) => id).sort((a, b) => +b.points - +a.points);

        if (search) {
            const filtered = sorted.filter(item => item?.id?.toString().toLowerCase().includes(search.toLowerCase()))

            return filtered.slice(0, SPECIAL_GROUP_AMOUNT)
        }

        return sorted.slice(0, SPECIAL_GROUP_AMOUNT);
    }, [leaderboard, search])

    const groupsContent = useMemo(() => {
        if (!groups.length && search) return (
            <WarningText>Ничего не найдено</WarningText>
        );

        if (isError) {
            return <WarningText>Что-то пошло не так, попробуй позже</WarningText>
        }

        if (isLoading) {
            return (
                <Groups>
                    <LoaderWrapper>
                        <Loader xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                            <circle fill="#EE7203" stroke="#EE7203" strokeWidth="10" r="15" cx="40" cy="100">
                                <animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                            </circle>
                            <circle fill="#EE7203" stroke="#EE7203" strokeWidth="10" r="15" cx="100" cy="100">
                                <animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                            </circle>
                            <circle fill="#EE7203" stroke="#EE7203" strokeWidth="10" r="15" cx="160" cy="100">
                                <animate attributeName="opacity" calcMode="spline" dur="1" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                            </circle>
                        </Loader>
                    </LoaderWrapper>
                </Groups>
            )
        }

        return (
            <Groups>
                <Group>
                    <List>
                        {groups.map((item, itemIndex) =>(
                            <Item key={itemIndex}>
                                <span>{itemIndex + 1}</span>
                                <span>{item.id}</span>
                                <span>{item?.points?.toString().padStart(2, '0')}</span>
                            </Item>
                        ))}
                    </List>
                </Group>
            </Groups>
        )
    }, [groups, isLoading, search, isError])

    const getData = async () => {
        try {
            const { week } = await ftClient.loadProjectState();
            const result = await ftClient.loadRecordsPublicData();
            
            setLeaderboard(result.map(d => ({...d, points: d[`scoreWeek${week}`]})));
        } catch {
            setIsError(true);
        }
    }

    useEffect(() => {
        setIsLoading(true)
        getData().finally(() => setIsLoading(false));
    }, []);

    return (
        <Wrapper>
            <LogoWrapper>
                <Logo src={logo} />
            </LogoWrapper>
            <Title>Рейтинг игроков Карьерного{'\n'}марафона «Вкусно – и точка»</Title>
            <Content>
                <SearchInput placeholder="Введи свой ID" value={search} onChange={setSearch} />
                {groupsContent}
            </Content>
        </Wrapper>
    )
}