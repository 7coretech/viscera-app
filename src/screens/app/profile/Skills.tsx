import ButtonComponent from "@/src/components/ButtonComponent";
import { appService } from "@/src/services/appApi/appService";
import { useTheme } from "@/src/theme";
import toast from "@/src/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const clinicalSkillOptions = [
  "ICU",
  "Emergency/ER",
  "Pediatric",
  "OR/Surgical",
  "NICU",
  "Telehealth",
  "Geriatric Care",
  "Mental Health/Psychiatric",
  "Public Health",
  "Community Health",
  "Home Health",
  "Hospice",
  "Labour & Delivery",
  "Crisis/Disaster Response",
];

const technicalSkillOptions = [
  "EMR Systems",
  "Cerner",
  "Telemetry",
  "EPIC",
  "Meditech",
  "Ventilator Management",
  "IV Insertion",
  "Phlebotomy",
];

const softSkillOptions = [
  "Leadership",
  "Time Management",
  "Empathy",
  "Problem Solving",
  "Teamwork",
  "Communication",
  "Adaptability",
  "Critical Thinking",
];

const Skills = () => {
  const theme = useTheme();
  const router = useRouter();

  const [clinicalSkills, setClinicalSkills] = useState<string[]>([]);
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [hasSkills, setHasSkills] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await appService.getSkills();
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setClinicalSkills(data.clinical || []);
        setTechnicalSkills(data.technical || []);
        setSoftSkills(data.soft || []);
        setHasSkills(true);
      }
    } catch (error) {
      console.log('Error fetching skills:', error);
    }
  };

  const [clinicalInput, setClinicalInput] = useState("");
  const [technicalInput, setTechnicalInput] = useState("");
  const [softInput, setSoftInput] = useState("");

  const [showClinicalOptions, setShowClinicalOptions] = useState(false);
  const [showTechnicalOptions, setShowTechnicalOptions] = useState(false);
  const [showSoftOptions, setShowSoftOptions] = useState(false);

  const addSkill = (
    skill: string,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setShowOptions: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setInput("");
      setShowOptions(false);
    }
  };

  const removeSkill = (
    skill: string,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    const payload = {
      clinical: clinicalSkills,
      technical: technicalSkills,
      soft: softSkills,
    };

    try {
      let response;
      if (hasSkills) {
        response = await appService.updateSkills(payload);
      } else {
        response = await appService.saveSkills(payload);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Skills saved successfully.");
        setHasSkills(true);
      }
    } catch (error: any) {
      console.log("Error saving skills:", error);
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save skills."
      );
    }
  };

  const renderSkillSection = (
    title: string,
    icon: string,
    bgColor: string,
    textColor: string,
    skills: string[],
    setSkills: React.Dispatch<React.SetStateAction<string[]>>,
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    showOptions: boolean,
    setShowOptions: React.Dispatch<React.SetStateAction<boolean>>,
    options: string[],
    borderColor?: string
  ) => (
    <View className="mb-4 p-4 rounded-xl" style={{ backgroundColor: bgColor, borderWidth: 0.5, borderColor: borderColor || textColor, }}>
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon as any} size={20} color={textColor} />
        <Text className="text-h4 font-semibold ml-2" style={{ color: textColor }}>
          {title}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {skills.map((skill) => (
          <View
            key={skill}
            className="flex-row items-center bg-white px-3 py-2 rounded-lg"
          >
            <Text className="text-small font-medium mr-2" style={{ color: textColor }}>
              {skill}
            </Text>
            <TouchableOpacity onPress={() => removeSkill(skill, skills, setSkills)}>
              <Ionicons name="close" size={16} color={textColor} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setShowOptions(!showOptions)}
          className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-dashed"
          style={{ borderColor: textColor }}
        >
          <Ionicons name="add" size={16} color={textColor} />
          <Text className="text-small font-medium ml-1" style={{ color: textColor }}>
            Add Skill
          </Text>
        </TouchableOpacity>
      </View>

      {showOptions && (
        <View className="mt-3">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type to search or add..."
            placeholderTextColor="#999"
            className="px-4 py-3 text-body1 text-text-primary bg-white rounded-lg border border-gray-light"
            onSubmitEditing={() =>
              addSkill(input, skills, setSkills, setInput, setShowOptions)
            }
            autoFocus
          />

          {input && (
            <View className="mt-2 bg-white border border-gray-light rounded-lg max-h-48">
              <ScrollView nestedScrollEnabled>
                {options
                  .filter((option) =>
                    option.toLowerCase().includes(input.toLowerCase())
                  )
                  .map((option) => (
                    <TouchableOpacity
                      key={option}
                      onPress={() =>
                        addSkill(option, skills, setSkills, setInput, setShowOptions)
                      }
                      className="px-4 py-3 border-b border-gray-extraLight"
                    >
                      <Text className="text-body1 text-text-primary">{option}</Text>
                    </TouchableOpacity>
                  ))}
                {!options.some((option) =>
                  option.toLowerCase().includes(input.toLowerCase())
                ) && (
                    <TouchableOpacity
                      onPress={() =>
                        addSkill(input, skills, setSkills, setInput, setShowOptions)
                      }
                      className="px-4 py-3"
                    >
                      <Text className="text-body1 font-medium" style={{ color: textColor }}>
                        Add &quot;{input}&quot;
                      </Text>
                    </TouchableOpacity>
                  )}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-white w-full">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-light">
        <TouchableOpacity
          onPress={() => {
            router.push("/app/(tabs)/profile");
          }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.palette.gery.darkGray}
          />
        </TouchableOpacity>

        <Text className="text-h2 font-semibold text-text-primary ml-4">
          Skills
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
      >
        {renderSkillSection(
          "Clinical Skills",
          "medkit",
          "#F0F8FF",
          "#0066CC",
          clinicalSkills,
          setClinicalSkills,
          clinicalInput,
          setClinicalInput,
          showClinicalOptions,
          setShowClinicalOptions,
          clinicalSkillOptions,
          "#0066CC"
        )}

        {renderSkillSection(
          "Technical Skills",
          "cog",
          "#F2F5FF",
          "#4D7FFF",
          technicalSkills,
          setTechnicalSkills,
          technicalInput,
          setTechnicalInput,
          showTechnicalOptions,
          setShowTechnicalOptions,
          technicalSkillOptions,
          "#007ACC"
        )}

        {renderSkillSection(
          "Soft Skills",
          "people",
          "#FDF5FF",
          "#B366FF",
          softSkills,
          setSoftSkills,
          softInput,
          setSoftInput,
          showSoftOptions,
          setShowSoftOptions,
          softSkillOptions,
          "#B366FF"
        )}
      </ScrollView>

      <View className="px-4 pb-2 mt-auto">
        <ButtonComponent
          title="Save Skills"
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
};

export default Skills;