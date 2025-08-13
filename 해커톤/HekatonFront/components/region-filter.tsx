"use client"

import { useState, useEffect } from "react"
import { MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// 한국 행정구역 데이터
const regionData = {
  서울특별시: [
    "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
  ],
  부산광역시: [
    "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구",
  ],
  대구광역시: ["남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  인천광역시: ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
  광주광역시: ["광산구", "남구", "동구", "북구", "서구"],
  대전광역시: ["대덕구", "동구", "서구", "유성구", "중구"],
  울산광역시: ["남구", "동구", "북구", "울주군", "중구"],
  세종특별자치시: ["세종시"],
  경기도: [
    "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시",
  ],
  강원도: [
    "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시", "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군",
  ],
  충청북도: [
    "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "진천군", "청주시", "충주시", "증평군",
  ],
  충청남도: [
    "계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군", "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군",
  ],
  전라북도: [
    "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시", "임실군", "장수군", "전주시", "정읍시", "진안군",
  ],
  전라남도: [
    "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군", "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군",
  ],
  경상북도: [
    "경산시", "경주시", "고령군", "구미시", "군위군", "김천시", "문경시", "봉화군", "상주시", "성주군", "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군", "포항시",
  ],
  경상남도: [
    "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시", "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군",
  ],
  제주특별자치도: ["서귀포시", "제주시"],
}

interface RegionFilterProps {
  onSelectionChange: (selection: string[]) => void;
}

export default function RegionFilter({ onSelectionChange }: RegionFilterProps) {
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<{ [key: string]: string[] }>({})
  const [selectedAll, setSelectedAll] = useState<{ [key: string]: boolean }>({})

  const provinces = Object.keys(regionData)
//API 호출부
  useEffect(() => {
    const results: string[] = []
    selectedProvinces.forEach((province) => {
      const isAllSelected = selectedAll[province] || false
      const cities = selectedCities[province] || []

      if (isAllSelected) {
        results.push(`${province}`)
      } else if (cities.length > 0) {
        cities.forEach((city) => {
          results.push(`${province} ${city}`)
        })
      }
    })
    onSelectionChange(results);
  }, [selectedProvinces, selectedCities, selectedAll, onSelectionChange]);

  const handleProvinceChange = (province: string, checked: boolean) => {
    if (checked) {
      setSelectedProvinces([...selectedProvinces, province])
      setSelectedAll({ ...selectedAll, [province]: true })
    } else {
      setSelectedProvinces(selectedProvinces.filter((p) => p !== province))
      const newSelectedCities = { ...selectedCities }
      const newSelectedAll = { ...selectedAll }
      delete newSelectedCities[province]
      delete newSelectedAll[province]
      setSelectedCities(newSelectedCities)
      setSelectedAll(newSelectedAll)
    }
  }

  const handleAllChange = (province: string, checked: boolean) => {
    const newSelectedCities = { ...selectedCities }
    if (checked) {
      delete newSelectedCities[province]
      setSelectedCities(newSelectedCities)
      setSelectedAll({ ...selectedAll, [province]: true })
    } else {
      setSelectedAll({ ...selectedAll, [province]: false })
    }
  }

  const handleCityChange = (province: string, city: string, checked: boolean) => {
    const currentCities = selectedCities[province] || []
    let newCities: string[]

    if (checked) {
      newCities = [...currentCities, city]
      setSelectedAll({ ...selectedAll, [province]: false })
    } else {
      newCities = currentCities.filter((c) => c !== city)
    }

    const allCities = regionData[province as keyof typeof regionData]

    if (newCities.length === allCities.length) {
      const newSelectedCities = { ...selectedCities }
      delete newSelectedCities[province]
      setSelectedCities(newSelectedCities)
      setSelectedAll({ ...selectedAll, [province]: true })
    } else {
      setSelectedCities({ ...selectedCities, [province]: newCities })
    }
  }

  const handleSelectAllCities = (province: string) => {
    const newSelectedCities = { ...selectedCities }
    delete newSelectedCities[province]
    setSelectedCities(newSelectedCities)
    setSelectedAll({ ...selectedAll, [province]: true })
  }

  const handleDeselectAllCities = (province: string) => {
    const newSelectedCities = { ...selectedCities }
    delete newSelectedCities[province]
    setSelectedCities(newSelectedCities)
    setSelectedAll({ ...selectedAll, [province]: false })
  }
  
  const handleReset = () => {
    setSelectedProvinces([])
    setSelectedCities({})
    setSelectedAll({})
  }

  const removeSelection = (province: string, city?: string) => {
    if (city) {
      const currentCities = selectedCities[province] || []
      setSelectedCities({
        ...selectedCities,
        [province]: currentCities.filter((c) => c !== city),
      })
    } else {
      setSelectedProvinces(selectedProvinces.filter((p) => p !== province))
      const newSelectedCities = { ...selectedCities }
      const newSelectedAll = { ...selectedAll }
      delete newSelectedCities[province]
      delete newSelectedAll[province]
      setSelectedCities(newSelectedCities)
      setSelectedAll(newSelectedAll)
    }
  }

  const getTotalSelectionsCount = () => {
    let total = 0;
    selectedProvinces.forEach(province => {
        const isAllSelected = selectedAll[province] || false;
        const cities = selectedCities[province] || [];

        if (isAllSelected) {
            total += (regionData[province as keyof typeof regionData] || []).length;
        } else {
            total += cities.length;
        }
    });
    return total;
  };


  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="w-4 h-4" />
                    도/특별시/광역시
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-80 pr-4">
                    <div className="space-y-2">
                        {provinces.map((province) => (
                        <div key={province} className="flex items-center space-x-2">
                            <Checkbox
                            id={province}
                            checked={selectedProvinces.includes(province)}
                            onCheckedChange={(checked) => handleProvinceChange(province, checked as boolean)}
                            />
                            <Label htmlFor={province} className="text-sm cursor-pointer">{province}</Label>
                        </div>
                        ))}
                    </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">시/군/구</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedProvinces.length === 0 ? (
                    <div className="flex items-center justify-center h-80 text-sm text-muted-foreground">
                        먼저 도/특별시/광역시를 선택해주세요.
                    </div>
                    ) : (
                    <ScrollArea className="h-80 pr-4">
                        <div className="space-y-5">
                        {selectedProvinces.map((province) => {
                            const cities = regionData[province as keyof typeof regionData];
                            const selectedCitiesForProvince = selectedCities[province] || [];
                            const isAllSelected = selectedAll[province] || false;

                            return (
                            <div key={province} className="space-y-2">
                                <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-md">{province}</h3>
                                <div className="flex gap-2">
                                    <Button variant="link" size="sm" onClick={() => handleSelectAllCities(province)} disabled={isAllSelected}>전체 선택</Button>
                                    <Button variant="link" size="sm" onClick={() => handleDeselectAllCities(province)} disabled={!isAllSelected && selectedCitiesForProvince.length === 0}>전체 해제</Button>
                                </div>
                                </div>
                                <div className="space-y-2">
                                <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-md">
                                    <Checkbox
                                    id={`${province}-all`}
                                    checked={isAllSelected}
                                    onCheckedChange={(checked) => handleAllChange(province, checked as boolean)}
                                    />
                                    <Label htmlFor={`${province}-all`} className="text-sm font-semibold cursor-pointer">전체 ({cities.length}개)</Label>
                                </div>
                                {!isAllSelected && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pl-2">
                                    {cities.map((city) => (
                                        <div key={city} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${province}-${city}`}
                                            checked={selectedCitiesForProvince.includes(city)}
                                            onCheckedChange={(checked) => handleCityChange(province, city, checked as boolean)}
                                        />
                                        <Label htmlFor={`${province}-${city}`} className="text-sm cursor-pointer">{city}</Label>
                                        </div>
                                    ))}
                                    </div>
                                )}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
        
        {(selectedProvinces.length > 0 || Object.values(selectedCities).some(c => c.length > 0)) && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base">선택된 지역 ({getTotalSelectionsCount()}개)</CardTitle>
                    <Button variant="ghost" size="sm" onClick={handleReset}>전체 초기화</Button>
                </CardHeader>
                <CardContent className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                    {selectedProvinces.map((province) => {
                        const isAllSelected = selectedAll[province] || false
                        const cities = selectedCities[province] || []

                        if (isAllSelected) {
                            return (
                                <Badge key={`${province}-all`} variant="default" className="flex items-center gap-1">
                                {province} 전체
                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeSelection(province)} />
                                </Badge>
                            )
                        } else if (cities.length > 0) {
                            return cities.map((city) => (
                                <Badge key={`${province}-${city}`} variant="secondary" className="flex items-center gap-1">
                                {province} {city}
                                <X className="w-3 h-3 cursor-pointer" onClick={() => removeSelection(province, city)} />
                                </Badge>
                            ))
                        }
                        return null;
                    })}
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
