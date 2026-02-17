package com.project.coreservice.config;

import com.project.coreservice.dto.FeedbackRequest;
import com.project.coreservice.dto.FeedbackResponseDTO;
import com.project.coreservice.entity.Feedback;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        // SET MATCHING STRATEGY TO STRICT
        mapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true);

        // Map Request to Entity (Skip the ID)
        mapper.typeMap(FeedbackRequest.class, Feedback.class).addMappings(m -> {
            m.skip(Feedback::setFeedbackId);
            m.skip(Feedback::setGoal);
            m.skip(Feedback::setReview);
        });

        // Map Entity to ResponseDTO with custom converters
        mapper.typeMap(Feedback.class, FeedbackResponseDTO.class).addMappings(m -> {
            // Map givenByUserId to giverId
            m.map(Feedback::getGivenByUserId, FeedbackResponseDTO::setGiverId);

            // Skip fields that need custom mapping
            m.skip(FeedbackResponseDTO::setGoalTitle);
            m.skip(FeedbackResponseDTO::setGoalId);
            m.skip(FeedbackResponseDTO::setGiverName);
        }).setPostConverter(context -> {
            Feedback source = context.getSource();
            FeedbackResponseDTO destination = context.getDestination();

            // Map goal fields if goal is present
            if (source.getGoal() != null) {
                destination.setGoalTitle(source.getGoal().getTitle());
                destination.setGoalId(source.getGoal().getGoalId());
            }

            // Note: giverName will need to be set by the service layer
            // since we need to fetch user data from AuthUserClient

            return destination;
        });

        return mapper;
    }
}
